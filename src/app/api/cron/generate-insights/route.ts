import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Resend } from 'resend'
import { calculateStreaks } from '@/services/habitService'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  
  // Protect the route using the CRON_SECRET token
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Debug env vars safely
  const resendKey = process.env.RESEND_API_KEY;
  console.log('Environment Check:', {
    hasResend: !!resendKey,
    resendEnding: resendKey ? `...${resendKey.slice(-4)}` : 'missing',
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasCronSecret: !!process.env.CRON_SECRET
  });

  const resend = new Resend(resendKey)

  try {
    // 1. Fetch all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, timezone')
    
    if (usersError) throw new Error(usersError.message)
    if (!users || users.length === 0) {
      return NextResponse.json({ message: 'No users found' })
    }

    const results = []

    for (const user of users) {
      try {
        console.log(`[Cron] Processing user: ${user.id} (${user.email})`);

        if (!user.email || !user.email.includes('@')) {
          console.log(`[Cron] Skipping user ${user.id} due to invalid or missing email.`);
          results.push({ userId: user.id, status: 'skipped_invalid_email' });
          continue;
        }

        let tz = user.timezone;
        if (!tz) {
          console.warn(`[WARNING] Timezone missing for user ${user.id} in cron. Falling back to UTC.`);
          tz = 'UTC';
        }
        
        // Use user's local date to figure out week and year
        const userNow = new Date();
        const userTodayStr = new Intl.DateTimeFormat('en-CA', {
          year: 'numeric', month: '2-digit', day: '2-digit', timeZone: tz
        }).format(userNow);
        const userTodayDate = new Date(userTodayStr);
        const week = Math.ceil(userTodayDate.getDate() / 7);
        const year = userTodayDate.getFullYear();

        // 2. Fetch user's active habits
        const { data: habits } = await supabase
          .from('habits')
          .select('id, name')
          .eq('user_id', user.id)
          .eq('is_active', true)

        if (!habits || habits.length === 0) {
          console.log(`[Cron] Skipping user ${user.id} due to no active habits.`);
          results.push({ userId: user.id, status: 'skipped_no_habits' });
          continue;
        }

        // 3. Fetch logs for the last 7 days & streaks
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const formattedDate = new Intl.DateTimeFormat('en-CA', {
          year: 'numeric', month: '2-digit', day: '2-digit', timeZone: tz
        }).format(sevenDaysAgo);
        
        const { data: logs } = await supabase
          .from('habit_logs')
          .select('*, habits!inner(name)')
          .eq('habits.user_id', user.id)
          .gte('date', formattedDate)

        // Summarize performance
        const habitCompletionSummary = habits.map(h => {
          const total = 7
          const completed = logs ? logs.filter(l => l.habit_id === h.id && l.completed).length : 0
          return `- ${h.name}: Completed ${completed}/${total} days.`
        }).join('\n')

        const streaks = await calculateStreaks(user.id, tz)
        const streakSummary = streaks.map(s => `- ${s.name}: Current streak ${s.current} days, longest ${s.longest} days.`).join('\n')

        let insightText = ''
        let structuredInsight: any = null

        // 4. Contact OpenAI for generating insight (if API key is present)
        if (process.env.OPENAI_API_KEY) {
          try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
              },
              body: JSON.stringify({
                model: 'gpt-4o-mini',
                response_format: { type: "json_object" },
                messages: [
                  {
                    role: 'system',
                    content: 'You are an encouraging AI productivity coach. Analyze the user\'s weekly habit performance and streaks. Return your response ONLY as a valid JSON object matching this exact structure: { "summary": "Brief 1-2 sentence overview", "motivational_coaching": "Direct encouraging advice", "strengths": "1-2 sentences on what they did well", "weaknesses": "1-2 sentences on areas to improve", "consistency_observations": "Note on their streak or daily pattern", "momentum_analysis": "How their week trended overall" }'
                  },
                  {
                    role: 'user',
                    content: `User: ${user.name}\nWeekly Habits:\n${habitCompletionSummary}\nStreaks:\n${streakSummary}`
                  }
                ],
                max_tokens: 350,
                temperature: 0.7
              })
            })

            const aiData = await response.json()
            const rawContent = aiData.choices?.[0]?.message?.content?.trim() || ''
            
            // Validate it's JSON
            if (rawContent) {
              structuredInsight = JSON.parse(rawContent)
              insightText = JSON.stringify(structuredInsight)
            }
          } catch (err) {
            console.error(`[Cron] AI Generation failed for user ${user.id}:`, err)
          }
        }

        // Default encouraging placeholder if OpenAI is not set up or fails
        if (!insightText || !structuredInsight) {
          const topHabit = habits[0]?.name || 'routines'
          structuredInsight = {
            summary: `Awesome work focusing on your ${topHabit} habit this week!`,
            motivational_coaching: "Stay consistent and build your daily momentum.",
            strengths: "You are tracking your routines.",
            weaknesses: "Try to log every single day to maximize results.",
            consistency_observations: "Your consistency is the key to long-term success.",
            momentum_analysis: "Keep pushing forward, you're building a strong foundation."
          }
          insightText = JSON.stringify(structuredInsight)
        }

        // 5. Query and upsert insight
        const { data: existingInsight } = await supabase
          .from('ai_insights')
          .select('id')
          .eq('user_id', user.id)
          .eq('week', week)
          .eq('year', year)
          .single()

        let dbError
        if (existingInsight) {
          const { error } = await supabase
            .from('ai_insights')
            .update({ insight_data: structuredInsight })
            .eq('id', existingInsight.id)
          dbError = error
        } else {
          const { error } = await supabase
            .from('ai_insights')
            .insert({
              user_id: user.id,
              insight_data: structuredInsight,
              week,
              year
            })
          dbError = error
        }

        if (dbError) {
          console.error(`[Cron] Error saving insight for user ${user.id}:`, dbError.message)
        }

        // 6. Send Email using Resend
        if (process.env.RESEND_API_KEY) {
          console.log(`[Cron] Attempting email for user ${user.id} to ${user.email}`);
          try {
            const resendResponse = await resend.emails.send({
              from: 'Habit OS <onboarding@resend.dev>',
              to: user.email,
              subject: 'Your Weekly Habit OS Summary',
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                  <h2 style="color: #00685f;">Hi ${user.name || 'there'},</h2>
                  <p>Here is your weekly activity summary from Habit OS:</p>
                  
                  <div style="background-color: #f0f7f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #004d46;">Your Habits</h3>
                    <ul style="line-height: 1.6;">
                      ${habitCompletionSummary.split('\n').map(line => `<li>${line.replace('- ', '')}</li>`).join('')}
                    </ul>
                  </div>

                  <div style="background-color: #fff8e1; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffe082;">
                    <h3 style="margin-top: 0; color: #f57f17;">Weekly AI Summary</h3>
                    <p style="margin-bottom: 12px; font-weight: 500;">${structuredInsight.summary}</p>
                    <p style="margin-bottom: 0; font-style: italic;">"${structuredInsight.motivational_coaching}"</p>
                  </div>
                  
                  <p>Keep up the great work!</p>
                  <p style="font-size: 12px; color: #888; margin-top: 40px;">
                    This email was sent by Habit OS.
                  </p>
                </div>
              `
            });
            
            if (resendResponse.error) {
              console.error(`[Cron] Resend returned an error for ${user.email}:`, resendResponse.error);
              results.push({ userId: user.id, status: 'saved_email_failed' })
            } else {
              console.log(`[Cron] Email sent successfully to ${user.email}`);
              results.push({ userId: user.id, status: 'saved_and_emailed' })
            }
          } catch (emailErr) {
            console.error(`[Cron] Thrown exception sending email to ${user.email}:`, emailErr);
            results.push({ userId: user.id, status: 'saved_email_failed' })
          }
        } else {
          console.log(`[Cron] Skipping email for ${user.email} because RESEND_API_KEY is missing.`);
          results.push({ userId: user.id, status: 'saved_no_email' })
        }
      } catch (userErr: any) {
        console.error(`[Cron] Unexpected error processing user ${user.id}:`, userErr)
        results.push({ userId: user.id, status: 'error_processing_user', error: userErr.message })
      }
    }

    return NextResponse.json({ success: true, processed: results.length, details: results })
  } catch (err: any) {
    console.error(`[Cron] Global fatal error:`, err);
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

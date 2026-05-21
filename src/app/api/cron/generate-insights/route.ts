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
      .select('id, name, email')
    
    if (usersError) throw new Error(usersError.message)
    if (!users || users.length === 0) {
      return NextResponse.json({ message: 'No users found' })
    }

    const now = new Date()
    const week = Math.ceil(now.getDate() / 7)
    const year = now.getFullYear()
    const results = []

    for (const user of users) {
      try {
        console.log(`[Cron] Processing user: ${user.id} (${user.email})`);

        if (!user.email || !user.email.includes('@')) {
          console.log(`[Cron] Skipping user ${user.id} due to invalid or missing email.`);
          results.push({ userId: user.id, status: 'skipped_invalid_email' });
          continue;
        }

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
        const formattedDate = sevenDaysAgo.toISOString().split('T')[0]
        
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

        const streaks = await calculateStreaks(user.id)
        const streakSummary = streaks.map(s => `- ${s.name}: Current streak ${s.current} days, longest ${s.longest} days.`).join('\n')

        let insightText = ''

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
                messages: [
                  {
                    role: 'system',
                    content: 'You are an encouraging AI productivity coach. Analyze the user\'s weekly habit performance and streaks. Provide a concise, personalized insight (max 3 sentences). Include motivational praise, streak analysis, and an actionable productivity tip.'
                  },
                  {
                    role: 'user',
                    content: `User: ${user.name}\nWeekly Habits:\n${habitCompletionSummary}\nStreaks:\n${streakSummary}`
                  }
                ],
                max_tokens: 150,
                temperature: 0.7
              })
            })

            const aiData = await response.json()
            insightText = aiData.choices?.[0]?.message?.content?.trim() || ''
          } catch (err) {
            console.error(`[Cron] AI Generation failed for user ${user.id}:`, err)
          }
        }

        // Default encouraging placeholder if OpenAI is not set up or fails
        if (!insightText) {
          const topHabit = habits[0]?.name || 'routines'
          insightText = `Awesome work focusing on your ${topHabit} habit this week! Stay consistent and build your daily momentum.`
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
            .update({ insight_text: insightText })
            .eq('id', existingInsight.id)
          dbError = error
        } else {
          const { error } = await supabase
            .from('ai_insights')
            .insert({
              user_id: user.id,
              insight_text: insightText,
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
                    <h3 style="margin-top: 0; color: #f57f17;">AI Insight</h3>
                    <p style="margin-bottom: 0; font-style: italic;">"${insightText}"</p>
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

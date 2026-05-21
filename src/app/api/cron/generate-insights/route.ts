import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  
  // Protect the route using the CRON_SECRET token
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 1. Fetch all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name')
    
    if (usersError) throw new Error(usersError.message)
    if (!users || users.length === 0) {
      return NextResponse.json({ message: 'No users found' })
    }

    const now = new Date()
    const week = Math.ceil(now.getDate() / 7)
    const year = now.getFullYear()
    const results = []

    for (const user of users) {
      // 2. Fetch user's active habits
      const { data: habits } = await supabase
        .from('habits')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('is_active', true)

      if (!habits || habits.length === 0) continue

      // 3. Fetch logs for the last 7 days
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
                  content: 'You are an encouraging AI productivity coach. Write a short, daily check-off summary analysis (max 2 sentences) for the user. Highlight their success or give a very short, actionable tip. Keep it encouraging and practical.'
                },
                {
                  role: 'user',
                  content: `User: ${user.name}\nWeekly Habits Data:\n${habitCompletionSummary}`
                }
              ],
              max_tokens: 100,
              temperature: 0.7
            })
          })

          const aiData = await response.json()
          insightText = aiData.choices?.[0]?.message?.content?.trim() || ''
        } catch (err) {
          console.error(`AI Generation failed for user ${user.id}:`, err)
        }
      }

      // Default encouraging placeholder if OpenAI is not set up
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
        console.error(`Error saving insight for user ${user.id}:`, dbError.message)
      } else {
        results.push({ userId: user.id, status: 'saved' })
      }
    }

    return NextResponse.json({ success: true, processed: results.length })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

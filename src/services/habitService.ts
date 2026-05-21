import { supabase } from '@/lib/supabase'

export async function getHabits(userId: string) {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return data
}

export async function createHabit(userId: string, payload: {
  name: string; category: string; frequency: string;
  target_days: number[]; color: string; icon: string
}) {
  const { data, error } = await supabase.from('habits').insert({ user_id: userId, ...payload }).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function updateHabit(habitId: string, payload: Partial<{
  name: string; category: string; frequency: string;
  target_days: number[]; color: string; icon: string
}>) {
  const { data, error } = await supabase.from('habits').update(payload).eq('id', habitId).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function deleteHabit(habitId: string) {
  const { error } = await supabase.from('habits').update({ is_active: false }).eq('id', habitId)
  if (error) throw new Error(error.message)
}

export async function getTodayLogs(userId: string, date: string) {
  const { data, error } = await supabase
    .from('habit_logs')
    .select('*, habits!inner(user_id)')
    .eq('habits.user_id', userId)
    .eq('date', date)
  if (error) throw new Error(error.message)
  return data
}

export async function toggleHabitLog(habitId: string, date: string, completed: boolean) {
  const { data, error } = await supabase
    .from('habit_logs')
    .upsert({ habit_id: habitId, date, completed }, { onConflict: 'habit_id,date' })
    .select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function getLogs90Days(userId: string) {
  const from = new Date()
  from.setDate(from.getDate() - 90)
  const { data, error } = await supabase
    .from('habit_logs')
    .select('*, habits!inner(user_id)')
    .eq('habits.user_id', userId)
    .gte('date', from.toISOString().split('T')[0])
  if (error) throw new Error(error.message)
  return data
}

export async function calculateStreaks(userId: string) {
  const logs = await getLogs90Days(userId)
  const habits = await getHabits(userId)
  return habits.map(habit => {
    const habitLogs = logs
      .filter(l => l.habit_id === habit.id && l.completed)
      .map(l => l.date)
      .sort()
      .reverse()
    let current = 0
    let longest = 0
    let streak = 0
    let prev: string | null = null
    for (const date of habitLogs) {
      if (!prev) { streak = 1 }
      else {
        const diff = (new Date(prev).getTime() - new Date(date).getTime()) / 86400000
        streak = diff === 1 ? streak + 1 : 1
      }
      if (streak > longest) longest = streak
      prev = date
    }
    current = streak
    return { habitId: habit.id, name: habit.name, current, longest }
  })
}

export async function getWeeklyInsight(userId: string) {
  const now = new Date()
  const week = Math.ceil(now.getDate() / 7)
  const year = now.getFullYear()
  const { data } = await supabase
    .from('ai_insights')
    .select('*')
    .eq('user_id', userId)
    .eq('week', week)
    .eq('year', year)
    .single()
  return data ?? null
}

// Real weekly completion trends for the last 5 weeks
export async function getWeeklyCompletionTrends(userId: string) {
  const habits = await getHabits(userId)
  if (habits.length === 0) return []

  const now = new Date()
  const weeks: { label: string; percentage: number }[] = []

  for (let w = 4; w >= 0; w--) {
    const weekEnd = new Date(now)
    weekEnd.setDate(now.getDate() - w * 7)
    const weekStart = new Date(weekEnd)
    weekStart.setDate(weekEnd.getDate() - 6)

    const startStr = weekStart.toISOString().split('T')[0]
    const endStr = weekEnd.toISOString().split('T')[0]

    const { data: logs } = await supabase
      .from('habit_logs')
      .select('*, habits!inner(user_id)')
      .eq('habits.user_id', userId)
      .gte('date', startStr)
      .lte('date', endStr)

    const completedCount = logs ? logs.filter(l => l.completed).length : 0
    const totalPossible = habits.length * 7
    const percentage = totalPossible > 0 ? Math.round((completedCount / totalPossible) * 100) : 0

    const weekNum = Math.ceil(weekStart.getDate() / 7)
    weeks.push({
      label: w === 0 ? 'Current' : `Week ${weekNum}`,
      percentage
    })
  }

  return weeks
}

// Real completion rate grouped by habit category (Morning/Afternoon/Evening/All day)
export async function getCategoryBreakdown(userId: string) {
  const habits = await getHabits(userId)
  if (habits.length === 0) return []

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const startStr = sevenDaysAgo.toISOString().split('T')[0]

  const { data: logs } = await supabase
    .from('habit_logs')
    .select('*, habits!inner(user_id, category)')
    .eq('habits.user_id', userId)
    .gte('date', startStr)

  const categories = ['Morning', 'Afternoon', 'Evening', 'All day']
  return categories.map(cat => {
    const catHabits = habits.filter(h => h.category === cat)
    if (catHabits.length === 0) return { category: cat, percentage: 0 }

    const catHabitIds = catHabits.map(h => h.id)
    const completedCount = logs
      ? logs.filter(l => catHabitIds.includes(l.habit_id) && l.completed).length
      : 0
    const totalPossible = catHabits.length * 7
    const percentage = totalPossible > 0 ? Math.round((completedCount / totalPossible) * 100) : 0
    return { category: cat, percentage }
  }).filter(c => c.percentage > 0 || habits.some(h => h.category === c.category))
}

// Real weekly success rate (last 7 days)
export async function getWeeklySuccessRate(userId: string) {
  const habits = await getHabits(userId)
  if (habits.length === 0) return { current: 0, previous: 0 }

  const now = new Date()

  // Current week
  const currentStart = new Date(now)
  currentStart.setDate(now.getDate() - 6)
  const currentStartStr = currentStart.toISOString().split('T')[0]
  const currentEndStr = now.toISOString().split('T')[0]

  const { data: currentLogs } = await supabase
    .from('habit_logs')
    .select('*, habits!inner(user_id)')
    .eq('habits.user_id', userId)
    .gte('date', currentStartStr)
    .lte('date', currentEndStr)

  const currentCompleted = currentLogs ? currentLogs.filter(l => l.completed).length : 0
  const totalPossible = habits.length * 7
  const current = totalPossible > 0 ? Math.round((currentCompleted / totalPossible) * 100) : 0

  // Previous week
  const prevEnd = new Date(currentStart)
  prevEnd.setDate(prevEnd.getDate() - 1)
  const prevStart = new Date(prevEnd)
  prevStart.setDate(prevEnd.getDate() - 6)

  const { data: prevLogs } = await supabase
    .from('habit_logs')
    .select('*, habits!inner(user_id)')
    .eq('habits.user_id', userId)
    .gte('date', prevStart.toISOString().split('T')[0])
    .lte('date', prevEnd.toISOString().split('T')[0])

  const prevCompleted = prevLogs ? prevLogs.filter(l => l.completed).length : 0
  const previous = totalPossible > 0 ? Math.round((prevCompleted / totalPossible) * 100) : 0

  return { current, previous }
}

// Real leaderboard — all users ranked by their best current streak
export async function getLeaderboard() {
  const { data: users } = await supabase
    .from('users')
    .select('id, name')

  if (!users || users.length === 0) return []

  const leaderboard: { userId: string; name: string; streak: number }[] = []

  for (const user of users) {
    try {
      const streaks = await calculateStreaks(user.id)
      const bestStreak = streaks.length > 0 ? Math.max(...streaks.map(s => s.current), 0) : 0
      leaderboard.push({
        userId: user.id,
        name: user.name || 'Anonymous',
        streak: bestStreak
      })
    } catch {
      leaderboard.push({ userId: user.id, name: user.name || 'Anonymous', streak: 0 })
    }
  }

  return leaderboard.sort((a, b) => b.streak - a.streak).slice(0, 10)
}

export async function saveMood(userId: string, date: string, emoji: string) {
  const moodHabitName = `__mood_${emoji}__`

  let { data: habit } = await supabase
    .from('habits')
    .select('id')
    .eq('user_id', userId)
    .eq('name', moodHabitName)
    .single()

  if (!habit) {
    const { data: newHabit, error: createError } = await supabase
      .from('habits')
      .insert({
        user_id: userId,
        name: moodHabitName,
        category: 'All day',
        frequency: 'Daily',
        target_days: [0, 1, 2, 3, 4, 5, 6],
        color: 'visual-only',
        icon: 'face'
      })
      .select('id')
      .single()
    if (createError) throw new Error(createError.message)
    habit = newHabit
  }

  const moodHabitId = habit.id

  const { data: moodHabits } = await supabase
    .from('habits')
    .select('id')
    .eq('user_id', userId)
    .like('name', '__mood_%')

  if (moodHabits && moodHabits.length > 0) {
    const moodHabitIds = moodHabits.map(h => h.id)
    await supabase
      .from('habit_logs')
      .update({ completed: false })
      .in('habit_id', moodHabitIds)
      .eq('date', date)
  }

  const { data, error } = await supabase
    .from('habit_logs')
    .upsert({ habit_id: moodHabitId, date, completed: true }, { onConflict: 'habit_id,date' })
    .select().single()

  if (error) throw new Error(error.message)
  return data
}

import { supabase } from '@/lib/supabase'
import { getLocalDate, addDays } from '@/app/today/dateUtils'

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

export async function getLogs90Days(userId: string, tz: string) {
  const todayStr = getLocalDate(tz);
  const fromStr = addDays(todayStr, -90);
  const { data, error } = await supabase
    .from('habit_logs')
    .select('*, habits!inner(user_id)')
    .eq('habits.user_id', userId)
    .gte('date', fromStr)
  if (error) throw new Error(error.message)
  return data
}

export async function calculateStreaks(userId: string, tz: string) {
  const logs = await getLogs90Days(userId, tz)
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

export async function getWeeklyInsight(userId: string, tz: string) {
  const todayStr = getLocalDate(tz);
  const d = new Date(todayStr + 'T12:00:00Z');
  const week = Math.ceil(d.getUTCDate() / 7)
  const year = d.getUTCFullYear()
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
export async function getWeeklyCompletionTrends(userId: string, tz: string) {
  const habits = await getHabits(userId)
  if (habits.length === 0) return []

  const todayStr = getLocalDate(tz)
  const weeks: { label: string; percentage: number }[] = []

  for (let w = 4; w >= 0; w--) {
    const endStr = addDays(todayStr, -(w * 7));
    const startStr = addDays(endStr, -6);

    const { data: logs } = await supabase
      .from('habit_logs')
      .select('*, habits!inner(user_id)')
      .eq('habits.user_id', userId)
      .gte('date', startStr)
      .lte('date', endStr)

    const completedCount = logs ? logs.filter(l => l.completed).length : 0
    const totalPossible = habits.length * 7
    const percentage = totalPossible > 0 ? Math.round((completedCount / totalPossible) * 100) : 0

    let label = 'Current';
    if (w === 1) label = 'Last Week';
    else if (w > 1) label = `${w} Weeks Ago`;

    weeks.push({
      label,
      percentage
    })
  }

  return weeks
}

// Real completion rate grouped by habit category (Morning/Afternoon/Evening/All day)
export async function getCategoryBreakdown(userId: string, tz: string) {
  const habits = await getHabits(userId)
  if (habits.length === 0) return []

  const todayStr = getLocalDate(tz)
  const startStr = addDays(todayStr, -7)

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
export async function getWeeklySuccessRate(userId: string, tz: string) {
  const habits = await getHabits(userId)
  if (habits.length === 0) return { current: 0, previous: 0 }

  const todayStr = getLocalDate(tz)

  // Current week
  const currentEndStr = todayStr
  const currentStartStr = addDays(todayStr, -6)

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
  const prevEndStr = addDays(currentStartStr, -1)
  const prevStartStr = addDays(prevEndStr, -6)

  const { data: prevLogs } = await supabase
    .from('habit_logs')
    .select('*, habits!inner(user_id)')
    .eq('habits.user_id', userId)
    .gte('date', prevStartStr)
    .lte('date', prevEndStr)

  const prevCompleted = prevLogs ? prevLogs.filter(l => l.completed).length : 0
  const previous = totalPossible > 0 ? Math.round((prevCompleted / totalPossible) * 100) : 0

  return { current, previous }
}

// Real leaderboard — all users ranked by their best current streak
export async function getLeaderboard() {
  const { data: users } = await supabase
    .from('users')
    .select('id, name, timezone')

  if (!users || users.length === 0) return []

  const leaderboard: { userId: string; name: string; streak: number }[] = []

  for (const user of users) {
    try {
      let tz = user.timezone;
      if (!tz) {
        console.warn(`[WARNING] Timezone missing for user ${user.id} in leaderboard. Falling back to UTC.`);
        tz = 'UTC';
      }
      const streaks = await calculateStreaks(user.id, tz)
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
  const { data, error } = await supabase
    .from('mood_logs')
    .upsert({ user_id: userId, date, emoji }, { onConflict: 'user_id,date' })
    .select().single()

  if (error) throw new Error(error.message)
  return data
}

export async function getMoodLogs90Days(userId: string, tz: string) {
  const todayStr = getLocalDate(tz);
  const fromStr = addDays(todayStr, -90);
  const { data, error } = await supabase
    .from('mood_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('date', fromStr)
  if (error) throw new Error(error.message)
  return data
}

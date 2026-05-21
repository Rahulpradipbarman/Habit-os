'use server'

import { revalidatePath } from 'next/cache'
import {
  createHabit,
  updateHabit,
  deleteHabit,
  toggleHabitLog,
  saveMood
} from '@/services/habitService'
import { supabase } from '@/lib/supabase'
import { logout } from './auth'

export async function saveMoodAction(userId: string, date: string, emoji: string) {
  const data = await saveMood(userId, date, emoji)
  revalidatePath('/today')
  return data
}

export async function toggleHabitLogAction(habitId: string, date: string, completed: boolean) {
  const data = await toggleHabitLog(habitId, date, completed)
  revalidatePath('/today')
  return data
}

export async function createHabitAction(userId: string, payload: {
  name: string; category: string; frequency: string;
  target_days: number[]; color: string; icon: string
}) {
  const data = await createHabit(userId, payload)
  revalidatePath('/today')
  return data
}

export async function updateHabitAction(habitId: string, payload: Partial<{
  name: string; category: string; frequency: string;
  target_days: number[]; color: string; icon: string
}>) {
  const data = await updateHabit(habitId, payload)
  revalidatePath('/today')
  return data
}

export async function deleteHabitAction(habitId: string) {
  await deleteHabit(habitId)
  revalidatePath('/today')
}

export async function updateSettingsAction(userId: string, payload: { name?: string; reminder_time?: string | null }) {
  const { data, error } = await supabase.from('users').update(payload).eq('id', userId).select().single()
  if (error) throw new Error(error.message)
  revalidatePath('/settings')
  return data
}

export async function deleteUserAction(userId: string) {
  const { error } = await supabase.from('users').delete().eq('id', userId)
  if (error) throw new Error(error.message)
  await logout()
}

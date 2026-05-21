import React from 'react';
import SettingsClient from './SettingsClient';
import { Metadata } from 'next';
import { requireAuth } from '@/app/actions/auth';
import { supabase } from '@/lib/supabase';

export const metadata: Metadata = {
  title: 'Habit OS - Settings',
  description: 'Configure your habit tracker preferences and toggle visual themes.',
};

export default async function SettingsPage() {
  const userId = await requireAuth();

  const { data: userData } = await supabase
    .from('users')
    .select('name, reminder_time')
    .eq('id', userId)
    .single();

  const name = userData?.name || '';
  const reminderTime = userData?.reminder_time || null;

  return <SettingsClient userId={userId} initialName={name} initialReminderTime={reminderTime} />;
}

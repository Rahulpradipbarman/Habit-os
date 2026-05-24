import React from 'react';
import SettingsClient from './SettingsClient';
import { Metadata } from 'next';
import { requireAuth } from '@/app/actions/auth';
import { supabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Habit OS - Settings',
  description: 'Configure your habit tracker preferences and toggle visual themes.',
};

export default async function SettingsPage() {
  await requireAuth();
  redirect('/today?tab=settings');
}

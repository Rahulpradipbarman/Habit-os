import React from 'react';
import TodayClient from './TodayClient';
import { Metadata } from 'next';
import { requireAuth } from '@/app/actions/auth';
import {
  getHabits,
  getTodayLogs,
  calculateStreaks,
  getWeeklyInsight,
  getLogs90Days,
  getWeeklyCompletionTrends,
  getCategoryBreakdown,
  getWeeklySuccessRate,
  getLeaderboard
} from '@/services/habitService';
import { getLocalDate, getTimeBasedGreeting } from '@/app/today/dateUtils';
import { supabase } from '@/lib/supabase';

export const metadata: Metadata = {
  title: 'Habit OS - Dashboard',
  description: 'Manage your daily habits and track streaks.',
};

export default async function TodayPage() {
  const userId = await requireAuth();

  const { data: userData } = await supabase.from('users').select('name, timezone').eq('id', userId).single();
  const userName = userData?.name || 'User';
  let userTimezone = userData?.timezone;
  
  if (!userTimezone) {
    console.warn(`[WARNING] Timezone missing for user ${userId} in database. Falling back to UTC temporarily.`);
    userTimezone = 'UTC';
  }

  // Calculate todayStr using the user's timezone
  const todayStr = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: userTimezone,
  }).format(new Date());

  const greeting = getTimeBasedGreeting(userTimezone);

  const [
    habits,
    todayLogs,
    streaks,
    weeklyInsight,
    logs90Days,
    weeklyTrends,
    categoryBreakdown,
    weeklySuccess,
    leaderboard
  ] = await Promise.all([
    getHabits(userId),
    getTodayLogs(userId, todayStr),
    calculateStreaks(userId, userTimezone),
    getWeeklyInsight(userId, userTimezone),
    getLogs90Days(userId, userTimezone),
    getWeeklyCompletionTrends(userId, userTimezone),
    getCategoryBreakdown(userId, userTimezone),
    getWeeklySuccessRate(userId, userTimezone),
    getLeaderboard()
  ]);

  return (
    <TodayClient
      userId={userId}
      todayStr={todayStr}
      userTimezone={userTimezone}
      greeting={greeting}
      initialHabits={habits}
      initialTodayLogs={todayLogs}
      initialStreaks={streaks}
      initialWeeklyInsight={weeklyInsight}
      initialLogs90Days={logs90Days}
      initialWeeklyTrends={weeklyTrends}
      initialCategoryBreakdown={categoryBreakdown}
      initialWeeklySuccess={weeklySuccess}
      initialLeaderboard={leaderboard}
      userName={userName}
    />
  );
}

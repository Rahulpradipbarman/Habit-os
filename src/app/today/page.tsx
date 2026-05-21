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
import { supabase } from '@/lib/supabase';

export const metadata: Metadata = {
  title: 'Habit OS - Dashboard',
  description: 'Manage your daily habits and track streaks.',
};

export default async function TodayPage() {
  const userId = await requireAuth();
  const todayStr = new Date().toISOString().split('T')[0];

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
    calculateStreaks(userId),
    getWeeklyInsight(userId),
    getLogs90Days(userId),
    getWeeklyCompletionTrends(userId),
    getCategoryBreakdown(userId),
    getWeeklySuccessRate(userId),
    getLeaderboard()
  ]);

  const { data: userData } = await supabase.from('users').select('name').eq('id', userId).single();
  const userName = userData?.name || 'User';

  return (
    <TodayClient
      userId={userId}
      todayStr={todayStr}
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

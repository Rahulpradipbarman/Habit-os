'use client';

import React, { useState, useEffect, useRef, useTransition, useOptimistic } from 'react';
import { useApp } from '@/context/AppContext';
import SidebarLayout from '@/components/SidebarLayout';
import HabitModal from '@/components/HabitModal';
import { toggleHabitLogAction, deleteHabitAction, createHabitAction, saveMoodAction } from '@/app/actions/habitActions';
import { Habit } from '@/context/AppContext';
import { getLocalDate, addDays, formatLocalDate, formatLocalTime } from '@/app/today/dateUtils';
import { useRouter } from 'next/navigation';

import { DashboardTab } from './tabs/DashboardTab';
import { LibraryTab } from './tabs/LibraryTab';
import { AnalyticsTab } from './tabs/AnalyticsTab';
import { CommunityTab } from './tabs/CommunityTab';
import { SettingsTab } from './tabs/SettingsTab';
import PerformanceTracker from '@/components/PerformanceTracker';

interface WeekTrend {
  label: string;
  percentage: number;
}

interface CategoryStat {
  category: string;
  percentage: number;
}

interface LeaderboardEntry {
  userId: string;
  name: string;
  streak: number;
}

interface TodayClientProps {
  userId: string;
  todayStr: string;
  userTimezone: string;
  greeting: string;
  initialHabits: any[];
  initialTodayLogs: any[];
  initialStreaks: any[];
  initialWeeklyInsight: any;
  initialLogs90Days: any[];
  initialWeeklyTrends: WeekTrend[];
  initialCategoryBreakdown: CategoryStat[];
  initialWeeklySuccess: { current: number; previous: number };
  initialLeaderboard: LeaderboardEntry[];
  initialMoodLogs90Days: any[];
  userName: string;
}

const getMoodFromLogs = (moodLogs: any[], dateStr: string) => {
  const log = moodLogs.find(log => log.date === dateStr);
  return log ? log.emoji : '';
};

export default function TodayClient({
  userId,
  todayStr,
  userTimezone,
  greeting,
  initialHabits,
  initialTodayLogs,
  initialStreaks,
  initialWeeklyInsight,
  initialLogs90Days,
  initialWeeklyTrends,
  initialCategoryBreakdown,
  initialWeeklySuccess,
  initialLeaderboard,
  initialMoodLogs90Days,
  userName
}: TodayClientProps) {
  const {
    activeTab,
    setActiveTab,
  } = useApp();

  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set([activeTab]));
  useEffect(() => {
    setVisitedTabs(prev => {
      if (prev.has(activeTab)) return prev;
      const next = new Set(prev);
      next.add(activeTab);
      return next;
    });
  }, [activeTab]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSearch, setActiveSearch] = useState('');
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const msUntilMidnight = midnight.getTime() - now.getTime();
    
    const timer = setTimeout(() => {
      router.refresh();
    }, msUntilMidnight);
    
    return () => clearTimeout(timer);
  }, [router, userTimezone]);

  const handleOpenEditModal = React.useCallback((habit: Habit | null) => {
    setEditingHabit(habit);
    setIsModalOpen(true);
  }, []);
  
  // Pomodoro Timer State
  const [timerTime, setTimerTime] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Map habits from db to frontend Habit structures
  const dbHabits = initialHabits.filter(h => !h.name.startsWith('__mood_'));
  const mappedHabits: Habit[] = dbHabits.map((habit) => {
    const isCompleted = initialTodayLogs.some(
      (log) => log.habit_id === habit.id && log.completed
    );
    const streakInfo = initialStreaks.find((s) => s.habitId === habit.id);
    const streakCount = streakInfo ? streakInfo.current : 0;
    const descriptionText = habit.color && !habit.color.startsWith('#')
      ? habit.color
      : `${habit.frequency} • ${habit.category}`;

    return {
      id: habit.id,
      title: habit.name,
      description: descriptionText,
      category: habit.category,
      icon: habit.icon,
      streak: streakCount,
      completed: isCompleted,
      frequency: habit.frequency
    };
  });

  const [optimisticHabits, toggleOptimisticHabit] = useOptimistic(
    mappedHabits,
    (state, habitId: string) => {
      return state.map((h) => {
        if (h.id === habitId) {
          const nextCompleted = !h.completed;
          return {
            ...h,
            completed: nextCompleted,
            streak: nextCompleted ? h.streak + 1 : Math.max(0, h.streak - 1),
          };
        }
        return h;
      });
    }
  );

  const dailyGoalCompleted = optimisticHabits.filter((h) => h.completed).length;
  const dailyGoalTotal = optimisticHabits.length;
  const currentStreak = optimisticHabits.length > 0 ? Math.max(...optimisticHabits.map((h) => h.streak), 0) : 0;

  // Mood selector state (optimistic)
  const initialMood = getMoodFromLogs(initialMoodLogs90Days, todayStr);
  const [currentMood, setCurrentMood] = useState(initialMood);
  const moodEmojis = ['☀️', '🌤️', '😊', '😐', '😔'];

  const getMoodGradient = React.useCallback((emoji: string) => {
    switch (emoji) {
      case '☀️': return 'bg-gradient-to-br from-yellow-50 to-orange-50';
      case '🌤️': return 'bg-gradient-to-br from-orange-50 to-yellow-50/50';
      case '😊': return 'bg-gradient-to-br from-green-50 to-emerald-50/50';
      case '😐': return 'bg-gradient-to-br from-gray-50 to-slate-50';
      case '😔': return 'bg-gradient-to-br from-blue-50 to-indigo-50/50';
      default: return 'bg-white';
    }
  }, []);

  const getMoodColorClass = React.useCallback((emoji: string) => {
    switch (emoji) {
      case '☀️': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case '🌤️': return 'bg-orange-50 text-orange-800 border-orange-100';
      case '😊': return 'bg-green-50 text-green-800 border-green-100';
      case '😐': return 'bg-gray-100 text-gray-800 border-gray-200';
      case '😔': return 'bg-blue-50 text-blue-800 border-blue-100';
      default: return 'bg-surface-container-low text-on-surface-variant border-outline-variant/20';
    }
  }, []);

  // Extract mood history from 90-day mood logs + optimistic current day
  const moodHistory = React.useMemo(() => {
    const moods: { date: string; emoji: string }[] = [];
    const moodLogs = initialMoodLogs90Days.filter(
      log => log.date !== todayStr
    );
    for (const log of moodLogs) {
      moods.push({ date: log.date, emoji: log.emoji });
    }
    if (currentMood) {
      moods.push({ date: todayStr, emoji: currentMood });
    }
    return moods.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30);
  }, [initialMoodLogs90Days, currentMood, todayStr]);

  // Confetti helper
  const triggerConfetti = React.useCallback((element: HTMLElement) => {
    const colors = ['#00685f', '#565e74', '#006387'];
    const rect = element.getBoundingClientRect();
    
    for (let i = 0; i < 15; i++) {
      const dot = document.createElement('div');
      dot.className = 'absolute w-2 h-2 rounded-full pointer-events-none z-50';
      dot.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      dot.style.left = `${window.scrollX + rect.left + rect.width / 2}px`;
      dot.style.top = `${window.scrollY + rect.top + rect.height / 2}px`;
      document.body.appendChild(dot);

      const angle = Math.random() * Math.PI * 2;
      const velocity = 3 + Math.random() * 5;
      let x = 0;
      let y = 0;
      let gravity = 0;
      let opacity = 1;

      const animate = () => {
        x += Math.cos(angle) * velocity;
        y += Math.sin(angle) * velocity + gravity;
        gravity += 0.25;
        opacity -= 0.025;

        dot.style.transform = `translate(${x}px, ${y}px)`;
        dot.style.opacity = opacity.toString();

        if (opacity > 0) {
          requestAnimationFrame(animate);
        } else {
          dot.remove();
        }
      };
      requestAnimationFrame(animate);
    }
  }, []);

  const handleHabitToggle = React.useCallback((id: string, eventTarget: HTMLElement | null) => {
    const habit = optimisticHabits.find((h) => h.id === id);
    if (!habit) return;

    const currentCompleted = habit.completed;
    if (!currentCompleted && eventTarget) {
      triggerConfetti(eventTarget);
    }

    startTransition(async () => {
      toggleOptimisticHabit(id);
      await toggleHabitLogAction(id, todayStr, !currentCompleted);
    });
  }, [optimisticHabits, todayStr, toggleOptimisticHabit, triggerConfetti]);

  const handleDeleteHabit = React.useCallback(async (id: string) => {
    await deleteHabitAction(id);
  }, []);

  const handleUsePreset = React.useCallback(async (title: string, desc: string, category: any, icon: string, freq: string) => {
    await createHabitAction(userId, {
      name: title,
      category,
      frequency: freq,
      target_days: [0, 1, 2, 3, 4, 5, 6],
      color: desc,
      icon: icon
    });
  }, [userId]);

  const handleSaveMood = React.useCallback(async (emoji: string) => {
    setCurrentMood(emoji);
    await saveMoodAction(userId, todayStr, emoji);
  }, [userId, todayStr]);

  // Pomodoro effect
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimerTime((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            if (timerRef.current) clearInterval(timerRef.current);
            alert("Focus session complete! Take a short break.");
            return 25 * 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning]);

  const handleTimerStartStop = React.useCallback(() => {
    setTimerRunning(prev => !prev);
  }, []);

  const handleTimerReset = React.useCallback(() => {
    setTimerRunning(false);
    setTimerTime(25 * 60);
  }, []);

  const formatTime = React.useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Filtered habits
  const filteredHabits = optimisticHabits.filter((h) => {
    if (!activeSearch.trim()) return true;
    return h.title.toLowerCase().includes(activeSearch.toLowerCase()) || 
           h.description.toLowerCase().includes(activeSearch.toLowerCase());
  });

  const initialTodayCompleted = dbHabits.filter(h => initialTodayLogs.some(log => log.habit_id === h.id && log.completed)).length;
  const todayDelta = dailyGoalCompleted - initialTodayCompleted;
  const totalWeeklyPossible = dbHabits.length * 7;
  
  // Use real weekly success rate + optimistic adjustments
  const optimisticWeeklySuccess = totalWeeklyPossible > 0 
    ? Math.max(0, Math.min(100, initialWeeklySuccess.current + Math.round((todayDelta / totalWeeklyPossible) * 100)))
    : initialWeeklySuccess.current;
  const weeklyDelta = optimisticWeeklySuccess - initialWeeklySuccess.previous;

  // Weekly day-by-day bars for the summary card (last 7 days from real data)
  const weekDayBars = React.useMemo(() => {
    const bars = [];
    for (let i = 6; i >= 0; i--) {
      const dateStr = addDays(todayStr, -i);
      const dayLogs = initialLogs90Days.filter(
        log => log.date === dateStr && log.completed
      );
      const completedCount = dateStr === todayStr ? dailyGoalCompleted : dayLogs.length;
      const ratio = dailyGoalTotal > 0 ? completedCount / dailyGoalTotal : 0;
      const d = new Date(dateStr + 'T12:00:00Z');
      bars.push({
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getUTCDay()],
        ratio: Math.min(ratio, 1),
      });
    }
    return bars;
  }, [initialLogs90Days, dailyGoalTotal, todayStr, dailyGoalCompleted]);

  const optimisticWeeklyTrends = React.useMemo(() => {
    if (initialWeeklyTrends.length === 0) return [];
    const newTrends = [...initialWeeklyTrends];
    const currentWeekIdx = newTrends.findIndex(w => w.label === 'Current');
    if (currentWeekIdx !== -1) {
       const percentageDelta = totalWeeklyPossible > 0 ? (todayDelta / totalWeeklyPossible) * 100 : 0;
       newTrends[currentWeekIdx] = {
         ...newTrends[currentWeekIdx],
         percentage: Math.max(0, Math.min(100, newTrends[currentWeekIdx].percentage + Math.round(percentageDelta)))
       };
    }
    return newTrends;
  }, [initialWeeklyTrends, todayDelta, totalWeeklyPossible]);

  const liveLeaderboard = React.useMemo(() => {
     return initialLeaderboard.map(entry => {
       if (entry.userId === userId) {
         return { ...entry, streak: Math.max(entry.streak, currentStreak) };
       }
       return entry;
     }).sort((a, b) => b.streak - a.streak);
  }, [initialLeaderboard, userId, currentStreak]);

  // AI Insight Eligibility Validation
  const displayedInsight = React.useMemo(() => {
    const uniqueDays = new Set(initialLogs90Days.map(log => log.date));
    const completedCount = initialLogs90Days.filter(log => log.completed).length;
    
    if (uniqueDays.size >= 5 && completedCount >= 5) {
      return initialWeeklyInsight;
    }
    return null;
  }, [initialLogs90Days, initialWeeklyInsight]);

  return (
    <SidebarLayout onAddHabitClick={() => { setEditingHabit(null); setIsModalOpen(true); }}>
      <PerformanceTracker />
      
      {/* Dynamic Content Switching using Keep-Alive visibility toggles */}
      {visitedTabs.has('dashboard') && (
        <DashboardTab
          isActive={activeTab === 'dashboard'}
          greeting={greeting}
          userName={userName}
          userTimezone={userTimezone}
          activeSearch={activeSearch}
          setActiveSearch={setActiveSearch}
          currentStreak={currentStreak}
          dailyGoalCompleted={dailyGoalCompleted}
          dailyGoalTotal={dailyGoalTotal}
          optimisticWeeklySuccess={optimisticWeeklySuccess}
          weekDayBars={weekDayBars}
          weeklyDelta={weeklyDelta}
          filteredHabits={filteredHabits}
          handleHabitToggle={handleHabitToggle}
          handleDeleteHabit={handleDeleteHabit}
          handleOpenEditModal={handleOpenEditModal}
          initialWeeklyInsight={displayedInsight}
          timerTime={timerTime}
          timerRunning={timerRunning}
          handleTimerStartStop={handleTimerStartStop}
          handleTimerReset={handleTimerReset}
          formatTime={formatTime}
          currentMood={currentMood}
          getMoodGradient={getMoodGradient}
          moodEmojis={moodEmojis}
          getMoodColorClass={getMoodColorClass}
          handleSaveMood={handleSaveMood}
          setActiveTab={setActiveTab}
        />
      )}

      {visitedTabs.has('library') && (
        <LibraryTab
          isActive={activeTab === 'library'}
          handleUsePreset={handleUsePreset}
          handleOpenEditModal={handleOpenEditModal}
        />
      )}

      {visitedTabs.has('analytics') && (
        <AnalyticsTab
          isActive={activeTab === 'analytics'}
          optimisticWeeklyTrends={optimisticWeeklyTrends}
          initialCategoryBreakdown={initialCategoryBreakdown}
          initialLogs90Days={initialLogs90Days}
          todayStr={todayStr}
          dailyGoalCompleted={dailyGoalCompleted}
          userTimezone={userTimezone}
          moodHistory={moodHistory}
          getMoodColorClass={getMoodColorClass}
        />
      )}

      {visitedTabs.has('community') && (
        <CommunityTab
          isActive={activeTab === 'community'}
          liveLeaderboard={liveLeaderboard}
          userId={userId}
        />
      )}

      {visitedTabs.has('settings') && (
        <SettingsTab
          isActive={activeTab === 'settings'}
          userId={userId}
        />
      )}

      {/* Habit Modal Form wrapper */}
      <HabitModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingHabit(null);
        }}
        habit={editingHabit || undefined}
        userId={userId}
      />
    </SidebarLayout>
  );
}

'use client';

import React, { useState, useEffect, useRef, useTransition, useOptimistic } from 'react';
import { useApp } from '@/context/AppContext';
import SidebarLayout from '@/components/SidebarLayout';
import HabitCard from '@/components/HabitCard';
import HabitModal from '@/components/HabitModal';
import InsightBanner from '@/components/InsightBanner';
import { toggleHabitLogAction, deleteHabitAction, createHabitAction, saveMoodAction } from '@/app/actions/habitActions';
import { Habit } from '@/context/AppContext';

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
  initialHabits: any[];
  initialTodayLogs: any[];
  initialStreaks: any[];
  initialWeeklyInsight: any;
  initialLogs90Days: any[];
  initialWeeklyTrends: WeekTrend[];
  initialCategoryBreakdown: CategoryStat[];
  initialWeeklySuccess: { current: number; previous: number };
  initialLeaderboard: LeaderboardEntry[];
  userName: string;
}

const getMoodFromLogs = (logs: any[]) => {
  const moodLog = logs.find(log => log.completed && log.habits?.name?.startsWith('__mood_'));
  if (moodLog) {
    return moodLog.habits.name.replace('__mood_', '').replace('__', '');
  }
  return '';
};

export default function TodayClient({
  userId,
  todayStr,
  initialHabits,
  initialTodayLogs,
  initialStreaks,
  initialWeeklyInsight,
  initialLogs90Days,
  initialWeeklyTrends,
  initialCategoryBreakdown,
  initialWeeklySuccess,
  initialLeaderboard,
  userName
}: TodayClientProps) {
  const {
    activeTab,
    setActiveTab,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSearch, setActiveSearch] = useState('');
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleOpenEditModal = (habit: Habit) => {
    setEditingHabit(habit);
    setIsModalOpen(true);
  };
  
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

  const heatmapData = React.useMemo(() => {
    const data = [];
    const today = new Date();
    const startOffset = today.getDay(); // days since Sunday
    const totalDays = 13 * 7; // 91 days (13 weeks)
    const startDate = new Date();
    startDate.setDate(today.getDate() - (totalDays - 1) - startOffset);

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      
      const isFuture = d > today;
      
      const dayLogs = initialLogs90Days.filter(
        log => log.date === dateStr && log.completed && !log.habits?.name?.startsWith('__mood_')
      );
      const completedCount = dayLogs.length;
      
      let level = 0;
      if (isFuture) {
        level = -1;
      } else if (completedCount === 0) {
        level = 0;
      } else if (completedCount === 1) {
        level = 1;
      } else if (completedCount === 2) {
        level = 2;
      } else {
        level = 3;
      }
      
      data.push({
        date: dateStr,
        count: completedCount,
        level,
      });
    }
    return data;
  }, [initialLogs90Days]);

  // Extract mood history from 90-day logs
  const moodHistory = React.useMemo(() => {
    const moods: { date: string; emoji: string }[] = [];
    const moodLogs = initialLogs90Days.filter(
      log => log.completed && log.habits?.name?.startsWith('__mood_')
    );
    for (const log of moodLogs) {
      const emoji = log.habits.name.replace('__mood_', '').replace('__', '');
      moods.push({ date: log.date, emoji });
    }
    return moods.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30);
  }, [initialLogs90Days]);

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
  // Confetti helper
  const triggerConfetti = (element: HTMLElement) => {
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
  };

  const handleHabitToggle = (id: string, eventTarget: HTMLElement) => {
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
  };

  const handleDeleteHabit = async (id: string) => {
    await deleteHabitAction(id);
  };

  const handleUsePreset = async (title: string, desc: string, category: any, icon: string, freq: string) => {
    await createHabitAction(userId, {
      name: title,
      category,
      frequency: freq,
      target_days: [0, 1, 2, 3, 4, 5, 6],
      color: desc,
      icon: icon
    });
  };

  const handleSaveMood = async (emoji: string) => {
    await saveMoodAction(userId, todayStr, emoji);
  };

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

  const handleTimerStartStop = () => {
    setTimerRunning(!timerRunning);
  };

  const handleTimerReset = () => {
    setTimerRunning(false);
    setTimerTime(25 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Mood selector
  const currentMood = getMoodFromLogs(initialTodayLogs);
  const moodEmojis = ['☀️', '🌤️', '😊', '😐', '😔'];

  // Filtered habits
  const filteredHabits = optimisticHabits.filter((h) => {
    if (!activeSearch.trim()) return true;
    return h.title.toLowerCase().includes(activeSearch.toLowerCase()) || 
           h.description.toLowerCase().includes(activeSearch.toLowerCase());
  });

  const dailyGoalCompleted = optimisticHabits.filter((h) => h.completed).length;
  const dailyGoalTotal = optimisticHabits.length;
  const currentStreak = optimisticHabits.length > 0 ? Math.max(...optimisticHabits.map((h) => h.streak), 0) : 0;

  // Use real weekly success rate
  const weeklySuccessRate = initialWeeklySuccess.current;
  const weeklyDelta = initialWeeklySuccess.current - initialWeeklySuccess.previous;

  const completionPercentage = dailyGoalTotal > 0 ? Math.round((dailyGoalCompleted / dailyGoalTotal) * 100) : 0;

  // Weekly day-by-day bars for the summary card (last 7 days from real data)
  const weekDayBars = React.useMemo(() => {
    const bars = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLogs = initialLogs90Days.filter(
        log => log.date === dateStr && log.completed && !log.habits?.name?.startsWith('__mood_')
      );
      const ratio = dailyGoalTotal > 0 ? dayLogs.length / dailyGoalTotal : 0;
      bars.push({
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()],
        ratio: Math.min(ratio, 1),
      });
    }
    return bars;
  }, [initialLogs90Days, dailyGoalTotal]);

  return (
    <SidebarLayout onAddHabitClick={() => { setEditingHabit(null); setIsModalOpen(true); }}>
      {/* Dynamic Content Switching depending on activeTab */}
      {activeTab === 'dashboard' ? (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className={`flex flex-col md:flex-row md:items-center justify-between gap-6 px-6 lg:px-16 py-6 bg-surface shadow-sm border-b border-outline-variant/10 sticky top-0 z-20`}>
            <div>
              <h2 className="font-headline text-3xl font-extrabold text-on-surface">
                Good morning, {userName}
              </h2>
              <p className="text-sm text-on-surface-variant font-medium mt-1">
                Welcome back to your workspace. Let’s focus on progress.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="hidden sm:flex items-center bg-surface-container rounded-full px-4 py-1.5 gap-2 border border-outline-variant/20 shadow-inner">
                <span className="material-symbols-outlined text-on-surface-variant text-lg">search</span>
                <input 
                  type="text" 
                  value={activeSearch}
                  onChange={(e) => setActiveSearch(e.target.value)}
                  placeholder="Search habits..." 
                  className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-on-surface w-40"
                />
              </div>
            </div>
          </header>

          {/* Scrollable Dashboard Body */}
          <section className="p-6 lg:p-16 space-y-10 flex-grow">
            
            {/* Summary Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: Current Streak */}
              <div className="bg-white p-6 rounded-xl habit-card-shadow flex flex-col justify-between border border-surface-container relative overflow-hidden group">
                <div className="z-10">
                  <p className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-wider mb-1">Current Streak</p>
                  <h3 className="font-headline text-3xl font-extrabold text-primary">{currentStreak} Days</h3>
                  <p className="text-xs text-on-surface-variant mt-3 font-medium">You're doing amazing! Consistency is key.</p>
                </div>
                <span className="material-symbols-outlined absolute -bottom-6 -right-6 text-primary opacity-[0.04] text-[130px] group-hover:scale-110 transition-transform duration-500 select-none" style={{ fontVariationSettings: "'FILL' 1" }}>
                  local_fire_department
                </span>
              </div>

              {/* Card 2: Daily Goal Percentage */}
              <div className="bg-white p-6 rounded-xl habit-card-shadow flex flex-col justify-between border border-surface-container">
                <div>
                  <p className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-wider mb-1">Daily Goal</p>
                  <h3 className="font-headline text-3xl font-extrabold text-secondary">
                    {dailyGoalCompleted} <span className="text-lg text-outline font-normal">/ {dailyGoalTotal}</span>
                  </h3>
                  <div className="w-full bg-surface-container h-2 rounded-full mt-4 overflow-hidden shadow-inner">
                    <div 
                      className="bg-primary h-full rounded-full transition-all duration-500" 
                      style={{ width: `${dailyGoalTotal > 0 ? (dailyGoalCompleted / dailyGoalTotal) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant mt-3 font-medium">
                  {dailyGoalCompleted === dailyGoalTotal && dailyGoalTotal > 0 
                    ? "Perfect score! All habits finished." 
                    : `${dailyGoalTotal - dailyGoalCompleted} remaining tasks to close your day.`
                  }
                </p>
              </div>

              {/* Card 3: Weekly Success — Real Data */}
              <div className="bg-white p-6 rounded-xl habit-card-shadow flex flex-col justify-between border border-surface-container">
                <div>
                  <p className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-wider mb-1">Weekly Success</p>
                  <h3 className="font-headline text-3xl font-extrabold text-tertiary-container">{weeklySuccessRate}%</h3>
                  
                  {/* Real day-by-day bars */}
                  <div className="flex gap-1.5 mt-4">
                    {weekDayBars.map((bar, i) => (
                      <div
                        key={i}
                        className={`flex-grow h-7 rounded-sm shadow-sm transition-all ${
                          bar.ratio > 0 ? 'bg-primary' : 'bg-surface-container'
                        }`}
                        style={{ opacity: bar.ratio > 0 ? Math.max(0.4, bar.ratio) : 1 }}
                        title={`${bar.day}: ${Math.round(bar.ratio * 100)}%`}
                      ></div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant mt-3 font-medium">
                  {weeklyDelta > 0
                    ? `Trending ${weeklyDelta}% higher than last week.`
                    : weeklyDelta < 0
                    ? `Down ${Math.abs(weeklyDelta)}% from last week. Keep pushing!`
                    : 'Same as last week. Stay consistent!'}
                </p>
              </div>
            </div>

            {/* Main Section: Checklist & Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Daily Checklist Column */}
              <div className="lg:col-span-7 bg-white p-6 rounded-xl habit-card-shadow border border-surface-container flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="font-headline text-xl font-bold text-on-surface">Daily Habits</h4>
                    <button 
                      onClick={() => { setEditingHabit(null); setIsModalOpen(true); }}
                      className="flex items-center gap-1 text-primary font-bold hover:underline text-sm transition-all"
                    >
                      <span className="material-symbols-outlined text-lg">add_circle</span>
                      <span className="font-headline">Add Habit</span>
                    </button>
                  </div>

                  {filteredHabits.length === 0 ? (
                    <div className="text-center py-12 px-4 border border-dashed border-outline-variant/60 rounded-xl bg-surface-container-low/40">
                      <span className="material-symbols-outlined text-5xl text-outline-variant/80 mb-3">checklist</span>
                      <h5 className="font-headline text-base font-bold text-on-surface">No habits tracked</h5>
                      <p className="text-xs text-on-surface-variant mt-1 max-w-xs mx-auto">
                        {activeSearch 
                          ? "We couldn't find any habits matching your search terms."
                          : "Establish morning meditations, hydration targets, or daily reading schedules by adding your first habit!"
                        }
                      </p>
                      {!activeSearch && (
                        <button 
                          onClick={() => { setEditingHabit(null); setIsModalOpen(true); }}
                          className="mt-4 px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-sm hover:opacity-90 active:scale-95 transition-all"
                        >
                          Create Habit
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredHabits.map((habit) => (
                        <HabitCard 
                          key={habit.id} 
                          habit={habit} 
                          onToggle={(id) => {
                            const btn = document.getElementById(`chk-${id}`);
                            handleHabitToggle(id, btn || document.body);
                          }}
                          onDelete={handleDeleteHabit}
                          onEdit={handleOpenEditModal}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Side Panels Column */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Milestone Insight Banner widget */}
                <InsightBanner insight={initialWeeklyInsight} />

                {/* Focus Timer Bento Box */}
                <div className="bg-white p-6 rounded-xl habit-card-shadow border border-surface-container">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-on-surface-variant text-lg">timer</span>
                    <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Deep Work</h3>
                  </div>

                  <div className="text-center py-2 flex flex-col items-center">
                    <span className="font-headline text-4xl font-extrabold text-primary tracking-tight select-none">
                      {formatTime(timerTime)}
                    </span>
                    
                    <div className="mt-4 flex justify-center gap-3">
                      <button 
                        onClick={handleTimerStartStop}
                        className={`p-3 rounded-full hover:scale-110 active:scale-95 transition-transform flex items-center justify-center shadow-md ${
                          timerRunning 
                            ? 'bg-secondary text-on-secondary' 
                            : 'bg-primary-container text-on-primary-container'
                        }`}
                        title={timerRunning ? 'Pause timer' : 'Start timer'}
                      >
                        <span className="material-symbols-outlined">
                          {timerRunning ? 'pause' : 'play_arrow'}
                        </span>
                      </button>
                      
                      <button 
                        onClick={handleTimerReset}
                        className="p-3 bg-surface-container-low text-on-surface-variant rounded-full border border-outline-variant/30 hover:bg-surface-container-high hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-sm"
                        title="Reset timer"
                      >
                        <span className="material-symbols-outlined">restart_alt</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mood Tracker Bento Box */}
                <div className="bg-white p-6 rounded-xl habit-card-shadow border border-surface-container flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">How are you feeling?</h3>
                    <div className="flex justify-between px-1">
                      {moodEmojis.map((emoji) => {
                        const isSelected = currentMood === emoji;
                        return (
                          <button
                            key={emoji}
                            onClick={() => handleSaveMood(emoji)}
                            className={`text-2xl transition-all hover:scale-125 ${
                              isSelected 
                                ? 'scale-125 shadow-sm p-1 bg-surface-container rounded-full' 
                                : 'grayscale hover:grayscale-0'
                            }`}
                          >
                            {emoji}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab('analytics')}
                    className="text-primary font-bold text-xs flex items-center gap-1 mt-5 hover:underline"
                  >
                    View Mood History <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : activeTab === 'library' ? (
        /* HABIT LIBRARY VIEW */
        <div className="p-6 lg:p-16 flex-1">
          <header className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="font-headline text-3xl font-extrabold text-on-surface">Habit Library</h2>
              <p className="text-sm text-on-surface-variant font-medium mt-1">Explore presets or manage your templates</p>
            </div>
            <button 
              onClick={() => { setEditingHabit(null); setIsModalOpen(true); }}
              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-md hover:opacity-95 active:scale-95 transition-all"
            >
              Add Custom Habit
            </button>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 border border-outline-variant bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <span className="material-symbols-outlined text-primary text-2xl mb-2">fitness_center</span>
              <h4 className="font-headline font-bold text-on-surface">Fitness Presets</h4>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">Preset templates for yoga, running, weightlifting, and stretch stretches.</p>
              <button 
                onClick={() => handleUsePreset('Daily Yoga', '15 mins morning session', 'Morning', 'fitness_center', 'Daily')}
                className="mt-4 text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
              >
                Use Preset <span className="material-symbols-outlined text-[14px]">add</span>
              </button>
            </div>
            
            <div className="p-5 border border-outline-variant bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <span className="material-symbols-outlined text-primary text-2xl mb-2">self_improvement</span>
              <h4 className="font-headline font-bold text-on-surface">Mental Health</h4>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">Preset templates for daily journaling, micro-meditations, and breathwork.</p>
              <button 
                onClick={() => handleUsePreset('Daily Breathing', '5 mins focused breath', 'Morning', 'self_improvement', 'Daily')}
                className="mt-4 text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
              >
                Use Preset <span className="material-symbols-outlined text-[14px]">add</span>
              </button>
            </div>

            <div className="p-5 border border-outline-variant bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <span className="material-symbols-outlined text-primary text-2xl mb-2">payments</span>
              <h4 className="font-headline font-bold text-on-surface">Financial habits</h4>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">Templates for daily budget logging, savings tracks, and investment checks.</p>
              <button 
                onClick={() => handleUsePreset('Log Expenses', 'Check banking ledger', 'Evening', 'payments', 'Daily')}
                className="mt-4 text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
              >
                Use Preset <span className="material-symbols-outlined text-[14px]">add</span>
              </button>
            </div>
          </div>
        </div>
      ) : activeTab === 'analytics' ? (
        /* ANALYTICS VIEW — Real Data */
        <div className="p-6 lg:p-16 flex-1">
          <header className="mb-6">
            <h2 className="font-headline text-3xl font-extrabold text-on-surface">Analytics & Insights</h2>
            <p className="text-sm text-on-surface-variant font-medium mt-1">Review your habit patterns over time</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Completion Trends — Real Weekly Data */}
            <div className="p-6 bg-white border border-surface-container rounded-xl shadow-sm">
              <h4 className="font-headline font-bold text-on-surface mb-4">Completion Trends</h4>
              <div className="h-64 flex items-end justify-between px-4 pb-2 border-b border-outline-variant/30 gap-3">
                {initialWeeklyTrends.length > 0 ? (
                  initialWeeklyTrends.map((week, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-t-lg transition-all duration-500 ${
                        i === initialWeeklyTrends.length - 1 ? 'bg-secondary' : 'bg-primary'
                      }`}
                      style={{ height: `${Math.max(week.percentage, 2)}%` }}
                      title={`${week.label}: ${week.percentage}%`}
                    ></div>
                  ))
                ) : (
                  <div className="flex-1 flex items-center justify-center text-xs text-on-surface-variant">
                    No data yet — start completing habits!
                  </div>
                )}
              </div>
              <div className="flex justify-between text-xs text-on-surface-variant mt-3 px-2">
                {initialWeeklyTrends.map((week, i) => (
                  <span key={i}>{week.label}</span>
                ))}
              </div>
            </div>

            {/* Category Breakdown — Real Data */}
            <div className="p-6 bg-white border border-surface-container rounded-xl shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="font-headline font-bold text-on-surface mb-2">Streak Master Rank</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Completion rates by time-of-day category over the past 7 days.
                </p>
              </div>
              
              <div className="space-y-3 mt-6">
                {initialCategoryBreakdown.length > 0 ? (
                  initialCategoryBreakdown.map((cat, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span>{cat.category} Habits</span>
                        <span>{cat.percentage}%</span>
                      </div>
                      <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-500"
                          style={{ width: `${cat.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-on-surface-variant">No category data yet. Add habits with different categories to see breakdowns.</p>
                )}
              </div>
            </div>
          </div>

          {/* 90-Day Consistency Heatmap Bento Card */}
          <div className="mt-6 p-6 bg-white border border-surface-container rounded-xl shadow-sm">
            <h4 className="font-headline font-bold text-on-surface mb-2">90-Day Consistency Heatmap</h4>
            <p className="text-xs text-on-surface-variant mb-6">Visualizing your daily habit completions over the last 13 weeks.</p>
            
            <div className="flex flex-col overflow-x-auto pb-2 scrollbar-thin">
              <div className="flex gap-2 min-w-[640px] items-center">
                {/* Day labels (Sun, Tue, Thu, Sat) */}
                <div className="grid grid-rows-7 text-[10px] text-on-surface-variant/70 font-semibold pr-2 select-none h-28 items-center">
                  <span>Sun</span>
                  <span></span>
                  <span>Tue</span>
                  <span></span>
                  <span>Thu</span>
                  <span></span>
                  <span>Sat</span>
                </div>
                
                {/* Heatmap Grid */}
                <div className="grid grid-flow-col grid-rows-7 gap-1 h-28">
                  {heatmapData.map((day, idx) => {
                    const isFuture = day.level === -1;
                    const levelColors = [
                      'bg-surface-container-low border border-outline-variant/20', // Level 0
                      'bg-primary/25 border border-primary/10',                  // Level 1
                      'bg-primary/55 border border-primary/20',                  // Level 2
                      'bg-primary border border-primary/30',                     // Level 3
                    ];
                    
                    return (
                      <div
                        key={idx}
                        className={`w-3.5 h-3.5 rounded-sm transition-all duration-300 ${
                          isFuture ? 'bg-transparent' : levelColors[day.level]
                        }`}
                        title={isFuture ? '' : `${day.date}: ${day.count} habits completed`}
                      />
                    );
                  })}
                </div>
              </div>
              
              {/* Legend */}
              <div className="flex items-center gap-1.5 text-[10px] text-on-surface-variant mt-4 justify-end">
                <span>Less</span>
                <div className="w-3.5 h-3.5 rounded-sm bg-surface-container-low border border-outline-variant/20" />
                <div className="w-3.5 h-3.5 rounded-sm bg-primary/25 border border-primary/10" />
                <div className="w-3.5 h-3.5 rounded-sm bg-primary/55 border border-primary/20" />
                <div className="w-3.5 h-3.5 rounded-sm bg-primary border border-primary/30" />
                <span>More</span>
              </div>
            </div>
          </div>

          {/* Mood History Section */}
          <div className="mt-6 p-6 bg-white border border-surface-container rounded-xl shadow-sm">
            <h4 className="font-headline font-bold text-on-surface mb-2">Mood History</h4>
            <p className="text-xs text-on-surface-variant mb-4">Your recorded moods over the past days.</p>
            
            {moodHistory.length > 0 ? (
              <div className="grid grid-cols-7 sm:grid-cols-10 gap-3">
                {moodHistory.map((entry, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-surface-container-low border border-outline-variant/20">
                    <span className="text-xl">{entry.emoji}</span>
                    <span className="text-[9px] text-on-surface-variant font-medium">
                      {new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-on-surface-variant">
                <span className="material-symbols-outlined text-3xl opacity-40 mb-2">mood</span>
                <p className="text-xs">No mood entries yet. Use the mood tracker on your dashboard to start recording.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* COMMUNITY VIEW — Real Leaderboard */
        <div className="p-6 lg:p-16 flex-1">
          <header className="mb-6">
            <h2 className="font-headline text-3xl font-extrabold text-on-surface">Community Leaderboard</h2>
            <p className="text-sm text-on-surface-variant font-medium mt-1">See how you measure up with others</p>
          </header>

          <div className="bg-white border border-surface-container rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant/30 flex justify-between text-xs font-extrabold text-on-surface-variant uppercase">
              <span>User</span>
              <span>Daily Streak</span>
            </div>
            <div className="divide-y divide-outline-variant/20">
              {initialLeaderboard.length > 0 ? (
                initialLeaderboard.map((entry, i) => {
                  const isCurrentUser = entry.userId === userId;
                  return (
                    <div key={entry.userId} className={`px-6 py-4 flex justify-between items-center ${isCurrentUser ? 'bg-secondary-container/10' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          i === 0 ? 'bg-yellow-100 text-yellow-700' :
                          i === 1 ? 'bg-gray-100 text-gray-600' :
                          i === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-primary/20 text-primary'
                        }`}>
                          {i + 1}
                        </div>
                        <span className={`text-sm ${isCurrentUser ? 'font-extrabold text-primary' : 'font-bold text-on-surface'}`}>
                          {isCurrentUser ? `${entry.name} (You)` : entry.name}
                        </span>
                      </div>
                      <span className={`text-sm font-bold ${isCurrentUser ? 'font-extrabold text-primary' : 'text-primary'}`}>
                        {entry.streak} Days
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="px-6 py-8 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-3xl opacity-40 mb-2">group</span>
                  <p className="text-xs">No leaderboard data yet. Start building streaks!</p>
                </div>
              )}
            </div>
          </div>
        </div>
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

import React from 'react';
import HabitCard from '@/components/HabitCard';
import InsightBanner from '@/components/InsightBanner';
import { Habit } from '@/context/AppContext';

interface DashboardTabProps {
  greeting: string;
  userName: string;
  userTimezone: string;
  activeSearch: string;
  setActiveSearch: (val: string) => void;
  currentStreak: number;
  dailyGoalCompleted: number;
  dailyGoalTotal: number;
  optimisticWeeklySuccess: number;
  weekDayBars: any[];
  weeklyDelta: number;
  filteredHabits: Habit[];
  handleHabitToggle: (id: string, target: HTMLElement | null) => void;
  handleDeleteHabit: (id: string) => void;
  handleOpenEditModal: (habit: Habit | null) => void;
  initialWeeklyInsight: any;
  timerTime: number;
  timerRunning: boolean;
  handleTimerStartStop: () => void;
  handleTimerReset: () => void;
  formatTime: (time: number) => string;
  currentMood: string;
  getMoodGradient: (mood: string) => string;
  moodEmojis: string[];
  getMoodColorClass: (mood: string) => string;
  handleSaveMood: (mood: string) => void;
  setActiveTab: (tab: string) => void;
  isActive: boolean;
}

export const DashboardTab = React.memo(function DashboardTab(props: DashboardTabProps) {
  return (
    <div className={`flex-1 flex flex-col ${props.isActive ? 'block' : 'hidden'}`}>
      {/* Header */}
      <header className={`flex flex-col md:flex-row md:items-center justify-between gap-6 px-6 lg:px-16 py-6 bg-surface shadow-sm border-b border-outline-variant/10 sticky top-0 z-20`}>
        <div>
          <h2 className="font-headline text-3xl font-extrabold text-on-surface">
            {props.greeting}, {props.userName} <span className="text-lg font-medium text-on-surface-variant opacity-70">({props.userTimezone})</span>
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
              value={props.activeSearch}
              onChange={(e) => props.setActiveSearch(e.target.value)}
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
              <h3 className="font-headline text-3xl font-extrabold text-primary">{props.currentStreak} Days</h3>
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
                {props.dailyGoalCompleted} <span className="text-lg text-outline font-normal">/ {props.dailyGoalTotal}</span>
              </h3>
              <div className="w-full bg-surface-container h-2 rounded-full mt-4 overflow-hidden shadow-inner">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-500" 
                  style={{ width: `${props.dailyGoalTotal > 0 ? (props.dailyGoalCompleted / props.dailyGoalTotal) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <p className="text-xs text-on-surface-variant mt-3 font-medium">
              {props.dailyGoalCompleted === props.dailyGoalTotal && props.dailyGoalTotal > 0 
                ? "Perfect score! All habits finished." 
                : `${props.dailyGoalTotal - props.dailyGoalCompleted} remaining tasks to close your day.`
              }
            </p>
          </div>

          {/* Card 3: Weekly Success — Real Data */}
          <div className="bg-white p-6 rounded-xl habit-card-shadow flex flex-col justify-between border border-surface-container">
            <div>
              <p className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-wider mb-1">Weekly Success</p>
              <h3 className="font-headline text-3xl font-extrabold text-tertiary-container">{props.optimisticWeeklySuccess}%</h3>
              
              {/* Real day-by-day bars */}
              <div className="flex gap-1.5 mt-4">
                {props.weekDayBars.map((bar, i) => (
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
              {props.weeklyDelta > 0
                ? `Trending ${props.weeklyDelta}% higher than last week.`
                : props.weeklyDelta < 0
                ? `Down ${Math.abs(props.weeklyDelta)}% from last week. Keep pushing!`
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
                  onClick={() => props.handleOpenEditModal(null)}
                  className="flex items-center gap-1 text-primary font-bold hover:underline text-sm transition-all"
                >
                  <span className="material-symbols-outlined text-lg">add_circle</span>
                  <span className="font-headline">Add Habit</span>
                </button>
              </div>

              {props.filteredHabits.length === 0 ? (
                <div className="text-center py-12 px-4 border border-dashed border-outline-variant/60 rounded-xl bg-surface-container-low/40">
                  <span className="material-symbols-outlined text-5xl text-outline-variant/60 mb-3 font-light">playlist_add_check_circle</span>
                  <h5 className="font-headline text-base font-medium text-on-surface">No habits tracked</h5>
                  <p className="text-xs text-on-surface-variant mt-1 max-w-xs mx-auto">
                    {props.activeSearch 
                      ? "We couldn't find any habits matching your search terms."
                      : "Your consistency journey starts today. Add a habit to begin."
                    }
                  </p>
                  {!props.activeSearch && (
                    <button 
                      onClick={() => props.handleOpenEditModal(null)}
                      className="mt-6 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-full shadow-sm hover:opacity-90 active:scale-95 transition-all"
                    >
                      Create Habit
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {props.filteredHabits.map((habit) => (
                    <HabitCard 
                      key={habit.id} 
                      habit={habit} 
                      onToggle={(id) => {
                        const btn = document.getElementById(`chk-${id}`);
                        props.handleHabitToggle(id, btn);
                      }}
                      onDelete={props.handleDeleteHabit}
                      onEdit={props.handleOpenEditModal}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Side Panels Column */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Milestone Insight Banner widget */}
            <InsightBanner insight={props.initialWeeklyInsight} />

            {/* Focus Timer Bento Box */}
            <div className="bg-white p-6 rounded-xl habit-card-shadow border border-surface-container">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-on-surface-variant text-lg">timer</span>
                <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Deep Work</h3>
              </div>

              <div className="text-center py-2 flex flex-col items-center">
                <span className="font-headline text-4xl font-extrabold text-primary tracking-tight select-none">
                  {props.formatTime(props.timerTime)}
                </span>
                
                <div className="mt-4 flex justify-center gap-3">
                  <button 
                    onClick={props.handleTimerStartStop}
                    className={`p-3 rounded-full hover:scale-110 active:scale-95 transition-transform flex items-center justify-center shadow-md ${
                      props.timerRunning 
                        ? 'bg-secondary text-on-secondary' 
                        : 'bg-primary-container text-on-primary-container'
                    }`}
                    title={props.timerRunning ? 'Pause timer' : 'Start timer'}
                  >
                    <span className="material-symbols-outlined">
                      {props.timerRunning ? 'pause' : 'play_arrow'}
                    </span>
                  </button>
                  
                  <button 
                    onClick={props.handleTimerReset}
                    className="p-3 bg-surface-container-low text-on-surface-variant rounded-full border border-outline-variant/30 hover:bg-surface-container-high hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-sm"
                    title="Reset timer"
                  >
                    <span className="material-symbols-outlined">restart_alt</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Mood Tracker Bento Box */}
            <div className={`bg-white p-6 rounded-xl habit-card-shadow border flex flex-col justify-between transition-colors duration-700 ease-in-out ${props.getMoodGradient(props.currentMood)} ${props.currentMood ? 'border-transparent' : 'border-surface-container'}`}>
              <div>
                <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">How are you feeling?</h3>
                <div className="flex justify-between px-1 items-center h-12">
                  {props.moodEmojis.map((emoji) => {
                    const isSelected = props.currentMood === emoji;
                    return (
                      <button
                        key={emoji}
                        onClick={() => props.handleSaveMood(emoji)}
                        className={`text-2xl transition-all duration-300 hover:scale-125 ${
                          isSelected 
                            ? `scale-125 shadow-sm p-1.5 rounded-full border ${props.getMoodColorClass(emoji)}`
                            : 'grayscale opacity-70 hover:grayscale-0 hover:opacity-100'
                        }`}
                      >
                        {emoji}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button 
                onClick={() => props.setActiveTab('analytics')}
                className="text-primary font-bold text-xs flex items-center gap-1 mt-5 hover:underline"
              >
                View Mood History <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
});

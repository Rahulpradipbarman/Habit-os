'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export interface InsightBannerProps {
  insight?: { content: string } | null;
}

export default function InsightBanner({ insight }: InsightBannerProps) {
  const { currentStreak, habits } = useApp();

  // Simple milestone tracking logic based on habits list
  const activeHabitCount = habits.length;
  const completedHabits = habits.filter((h) => h.completed).length;

  if (insight === undefined) {
    return (
      <div className="animate-pulse bg-surface-container-high h-36 rounded-xl border border-outline-variant/20 flex flex-col justify-between p-6">
        <div className="space-y-3">
          <div className="h-4 bg-outline-variant/40 rounded w-1/3"></div>
          <div className="h-6 bg-outline-variant/40 rounded w-3/4"></div>
          <div className="h-4 bg-outline-variant/40 rounded w-5/6"></div>
        </div>
        <div className="h-3 bg-outline-variant/40 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="bg-primary text-white p-6 rounded-xl shadow-lg relative overflow-hidden group border border-primary-container/20">
      <div className="z-10 relative">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
            {insight ? 'insights' : 'military_tech'}
          </span>
          <p className="text-[10px] font-extrabold uppercase tracking-widest opacity-90">
            {insight ? 'AI Weekly Insight' : 'Next Milestone'}
          </p>
        </div>
        
        <h4 className="font-headline text-xl font-bold mb-1">
          {insight ? 'Weekly Focus' : 'Consistency King'}
        </h4>
        <p className="text-sm opacity-90 mb-4">
          {insight 
            ? insight.content
            : currentStreak >= 15 
              ? "You've reached a 15-day streak! Keep pushing for 30 days."
              : `${Math.max(1, 15 - currentStreak)} more days to reach a 15-day streak!`
          }
        </p>
        
        {!insight && (
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-white rounded-full transition-opacity"></div>
            <div className="w-3 h-3 bg-white rounded-full transition-opacity"></div>
            <div className="w-3 h-3 bg-white rounded-full transition-opacity"></div>
            <div className={`w-3 h-3 bg-white rounded-full transition-opacity ${currentStreak >= 10 ? 'opacity-100' : 'opacity-40'}`}></div>
            <div className={`w-3 h-3 bg-white rounded-full transition-opacity ${currentStreak >= 15 ? 'opacity-100' : 'opacity-40'}`}></div>
          </div>
        )}
      </div>
      <span 
        className="material-symbols-outlined absolute -right-6 -bottom-6 text-white opacity-[0.08] text-[150px] rotate-12 group-hover:rotate-0 transition-transform duration-700 select-none"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {insight ? 'lightbulb' : 'trophy'}
      </span>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useApp, Habit } from '@/context/AppContext';

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (habit: Habit) => void;
}

export default function HabitCard({ habit, onToggle, onDelete, onEdit }: HabitCardProps) {
  const { theme } = useApp();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAnimating(true);
    onToggle(habit.id);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${habit.title}"?`)) {
      onDelete(habit.id);
    }
  };

  // Icon coloring logic helper
  const getIconColors = () => {
    if (theme === 'calm') {
      return 'bg-secondary-container text-primary';
    } else {
      // Vibrant has different container accents
      const categories: { [key: string]: string } = {
        'Morning': 'bg-primary-fixed text-on-primary-fixed-variant',
        'Afternoon': 'bg-tertiary-container text-on-tertiary-container',
        'Evening': 'bg-secondary-container text-on-secondary-container',
        'All day': 'bg-secondary-container text-on-secondary-container',
      };
      return categories[habit.category] || 'bg-surface-container-high text-primary';
    }
  };

  return (
    <>
      {/* Calm Authority Habit Card Style */}
      {theme === 'calm' && (
        <div className="flex items-center p-4 border border-outline-variant rounded-xl group habit-card-shadow transition-all duration-300 bg-white">
          <div 
            onClick={() => onEdit?.(habit)}
            className="w-10 h-10 flex items-center justify-center rounded-full ${getIconColors()} mr-4 shadow-sm cursor-pointer select-none"
          >
            <span className="material-symbols-outlined">{habit.icon}</span>
          </div>
          
          <div 
            onClick={() => onEdit?.(habit)}
            className="flex-grow cursor-pointer select-none"
          >
            <h5 className="font-headline text-base font-bold text-on-surface leading-tight">{habit.title}</h5>
            <p className="text-xs text-on-surface-variant mt-0.5">{habit.description}</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Streak display */}
            {habit.streak > 0 && (
              <div className="flex items-center gap-1 text-primary">
                <span className="material-symbols-outlined text-[18px]">local_fire_department</span>
                <span className="text-xs font-bold font-headline">{habit.streak}d</span>
              </div>
            )}

            {/* Trash option */}
            <button 
              onClick={handleDeleteClick}
              className="text-on-surface-variant/40 hover:text-error opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg"
              title="Delete habit"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>

            {/* Checkbox */}
            <button
              onClick={handleToggleClick}
              className={`w-10 h-10 border-2 border-primary rounded-lg flex items-center justify-center transition-all ${
                habit.completed 
                  ? 'bg-primary text-white scale-95 shadow-sm' 
                  : 'text-transparent hover:bg-primary-container/20'
              } ${isAnimating ? 'animate-check' : ''}`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                check
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Vibrant Momentum Habit Card Style */}
      {theme === 'vibrant' && (
        <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg hover:bg-surface-variant transition-colors group border border-outline-variant/20 bento-card">
          <div 
            onClick={() => onEdit?.(habit)}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className={`w-12 h-12 rounded-lg ${getIconColors()} flex items-center justify-center shadow-sm`}>
              <span className="material-symbols-outlined text-xl">{habit.icon}</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-on-background leading-tight">{habit.title}</h4>
              <p className="text-xs text-on-surface-variant mt-0.5">{habit.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Streak Flame */}
            <div className="flex items-center gap-0.5 text-on-surface-variant group-hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: habit.streak > 0 ? "'FILL' 1" : "'FILL' 0" }}>
                local_fire_department
              </span>
              <span className="text-xs font-bold font-headline">{habit.streak}</span>
            </div>

            {/* Trash option */}
            <button 
              onClick={handleDeleteClick}
              className="text-on-surface-variant/40 hover:text-error opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg"
              title="Delete habit"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>

            {/* Check Button */}
            <button
              onClick={handleToggleClick}
              className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                habit.completed
                  ? 'bg-secondary border-secondary text-on-secondary shadow-md scale-95'
                  : 'border-dashed border-outline hover:border-solid hover:bg-secondary/10 hover:border-secondary'
              } ${isAnimating ? 'animate-check' : ''}`}
            >
              <span className="material-symbols-outlined">
                {habit.completed ? 'done_all' : 'check'}
              </span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

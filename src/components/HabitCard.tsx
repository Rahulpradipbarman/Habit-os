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
    return 'bg-secondary-container text-primary';
  };

  return (
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
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useApp, Habit } from '@/context/AppContext';
import { createHabitAction, updateHabitAction, deleteHabitAction } from '@/app/actions/habitActions';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit?: Habit | null;
  userId: string;
}

const presetIcons = [
  { name: 'self_improvement', label: 'Mind' },
  { name: 'water_drop', label: 'Hydrate' },
  { name: 'menu_book', label: 'Read' },
  { name: 'nightlight', label: 'Rest' },
  { name: 'fitness_center', label: 'Gym' },
  { name: 'payments', label: 'Finance' },
  { name: 'local_cafe', label: 'Nutrition' },
  { name: 'directions_run', label: 'Cardio' },
  { name: 'edit', label: 'Journal' },
];

export default function HabitModal({ isOpen, onClose, habit, userId }: HabitModalProps) {
  const { theme } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'Morning' | 'Afternoon' | 'Evening' | 'All day'>('Morning');
  const [icon, setIcon] = useState('checklist');
  const [frequency, setFrequency] = useState('Daily');
  const [startingStreak, setStartingStreak] = useState(0);

  useEffect(() => {
    if (habit) {
      setTitle(habit.title);
      setDescription(habit.description);
      setCategory(habit.category);
      setIcon(habit.icon);
      setFrequency(habit.frequency);
      setStartingStreak(habit.streak);
    } else {
      setTitle('');
      setDescription('');
      setCategory('Morning');
      setIcon('checklist');
      setFrequency('Daily');
      setStartingStreak(0);
    }
  }, [habit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    // Default description if empty
    const finalDesc = description.trim() || `${frequency} • ${category}`;
    
    if (habit) {
      await updateHabitAction(habit.id, {
        name: title,
        color: finalDesc,
        category,
        icon,
        frequency
      });
    } else {
      await createHabitAction(userId, {
        name: title,
        color: finalDesc,
        category,
        icon,
        frequency,
        target_days: [0, 1, 2, 3, 4, 5, 6]
      });
    }
    
    // Reset form
    setTitle('');
    setDescription('');
    setCategory('Morning');
    setIcon('checklist');
    setFrequency('Daily');
    setStartingStreak(0);
    onClose();
  };

  const handleDelete = async () => {
    if (habit && confirm(`Are you sure you want to delete "${habit.title}"?`)) {
      await deleteHabitAction(habit.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Modal Container */}
      <div 
        className={`w-full max-w-md bg-white shadow-2xl overflow-hidden border border-outline-variant/20 transition-all duration-300 ${
          theme === 'calm' ? 'rounded-xl' : 'rounded-lg'
        }`}
      >
        {/* Header */}
        <div className={`px-6 py-4 flex justify-between items-center border-b border-outline-variant/30 ${
          theme === 'calm' ? 'bg-surface-container-low' : 'bg-surface-container-lowest'
        }`}>
          <h3 className={`font-headline text-lg font-bold text-on-surface ${theme === 'vibrant' ? 'font-black text-primary' : ''}`}>
            Create New Habit
          </h3>
          <button 
            onClick={onClose} 
            className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Habit Name *
            </label>
            {theme === 'calm' ? (
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Write 500 words"
                className="w-full bg-transparent border-b-2 border-outline-variant focus:border-primary focus:ring-0 px-1 py-1.5 text-sm font-headline text-on-surface outline-none transition-colors"
              />
            ) : (
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Write 500 words"
                className="w-full bg-surface-container-low border border-transparent focus:border-primary focus:bg-white focus:ring-0 px-3 py-2 rounded-lg text-sm text-on-surface outline-none transition-all"
              />
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Description / Goal
            </label>
            {theme === 'calm' ? (
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. 30 minutes • Morning routine"
                className="w-full bg-transparent border-b-2 border-outline-variant focus:border-primary focus:ring-0 px-1 py-1.5 text-sm font-headline text-on-surface outline-none transition-colors"
              />
            ) : (
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. 30 minutes • Morning routine"
                className="w-full bg-surface-container-low border border-transparent focus:border-primary focus:bg-white focus:ring-0 px-3 py-2 rounded-lg text-sm text-on-surface outline-none transition-all"
              />
            )}
          </div>

          {/* Category & Frequency Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Time of Day
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className={`w-full text-sm py-2 px-3 border outline-none bg-white ${
                  theme === 'calm'
                    ? 'border-outline-variant rounded-lg font-headline focus:border-primary'
                    : 'border-transparent bg-surface-container-low rounded-lg focus:border-primary focus:bg-white'
                }`}
              >
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Evening">Evening</option>
                <option value="All day">All Day</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className={`w-full text-sm py-2 px-3 border outline-none bg-white ${
                  theme === 'calm'
                    ? 'border-outline-variant rounded-lg font-headline focus:border-primary'
                    : 'border-transparent bg-surface-container-low rounded-lg focus:border-primary focus:bg-white'
                }`}
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>
          </div>

          {/* Starting Streak */}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Starting Streak (days)
            </label>
            {theme === 'calm' ? (
              <input
                type="number"
                min="0"
                value={startingStreak}
                onChange={(e) => setStartingStreak(parseInt(e.target.value) || 0)}
                className="w-full bg-transparent border-b-2 border-outline-variant focus:border-primary focus:ring-0 px-1 py-1.5 text-sm font-headline text-on-surface outline-none transition-colors"
              />
            ) : (
              <input
                type="number"
                min="0"
                value={startingStreak}
                onChange={(e) => setStartingStreak(parseInt(e.target.value) || 0)}
                className="w-full bg-surface-container-low border border-transparent focus:border-primary focus:bg-white focus:ring-0 px-3 py-2 rounded-lg text-sm text-on-surface outline-none transition-all"
              />
            )}
          </div>

          {/* Preset Icon Grid Selector */}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Select Icon
            </label>
            <div className="grid grid-cols-5 gap-2">
              {presetIcons.map((i) => {
                const isSelected = icon === i.name;
                return (
                  <button
                    key={i.name}
                    type="button"
                    onClick={() => setIcon(i.name)}
                    title={i.label}
                    className={`flex flex-col items-center justify-center p-2 border transition-all ${
                      isSelected
                        ? theme === 'calm'
                          ? 'bg-secondary-container border-primary text-primary font-bold'
                          : 'bg-primary-container border-primary text-on-primary-container font-bold scale-105 shadow-sm'
                        : theme === 'calm'
                          ? 'border-outline-variant hover:bg-surface-container-low text-on-surface-variant'
                          : 'border-transparent bg-surface-container-low hover:bg-surface-variant text-on-surface-variant'
                    } ${theme === 'calm' ? 'rounded-lg' : 'rounded-lg'}`}
                  >
                    <span className="material-symbols-outlined text-lg">{i.name}</span>
                  </button>
                );
              })}
              {/* Default fallback checklist option */}
              <button
                type="button"
                onClick={() => setIcon('checklist')}
                className={`flex flex-col items-center justify-center p-2 border transition-all ${
                  icon === 'checklist'
                    ? theme === 'calm'
                      ? 'bg-secondary-container border-primary text-primary font-bold'
                      : 'bg-primary-container border-primary text-on-primary-container font-bold scale-105 shadow-sm'
                    : theme === 'calm'
                      ? 'border-outline-variant hover:bg-surface-container-low text-on-surface-variant'
                      : 'border-transparent bg-surface-container-low hover:bg-surface-variant text-on-surface-variant'
                } ${theme === 'calm' ? 'rounded-lg' : 'rounded-lg'}`}
              >
                <span className="material-symbols-outlined text-lg">checklist</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3">
            {habit && (
              <button
                type="button"
                onClick={handleDelete}
                className={`mr-auto px-4 py-2 border border-error text-error text-xs font-bold transition-all ${
                  theme === 'calm'
                    ? 'rounded-lg hover:bg-error/5 active:scale-95'
                    : 'rounded-full hover:bg-error/5 hover:scale-102 active:scale-95'
                }`}
              >
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-xs font-bold transition-all ${
                theme === 'calm'
                  ? 'border border-outline text-on-surface-variant rounded-lg hover:bg-surface-container-low active:scale-95'
                  : 'bg-surface-container hover:bg-surface-variant text-on-surface-variant rounded-full hover:scale-102 active:scale-95'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-xs font-bold text-white transition-all shadow-md ${
                theme === 'calm'
                  ? 'bg-primary rounded-lg hover:bg-primary/95 active:scale-95'
                  : 'bg-primary rounded-full hover:scale-105 active:scale-95 shadow-[0px_5px_15px_rgba(255,126,103,0.3)]'
              }`}
            >
              {habit ? 'Save Changes' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

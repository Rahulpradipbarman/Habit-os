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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'Morning' | 'Afternoon' | 'Evening' | 'All day'>('Morning');
  const [icon, setIcon] = useState('checklist');
  const [frequency, setFrequency] = useState('Daily');

  useEffect(() => {
    if (habit) {
      setTitle(habit.title);
      setDescription(habit.description);
      setCategory(habit.category);
      setIcon(habit.icon);
      setFrequency(habit.frequency);
    } else {
      setTitle('');
      setDescription('');
      setCategory('Morning');
      setIcon('checklist');
      setFrequency('Daily');
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
      <div className="w-full max-w-md bg-white shadow-2xl overflow-hidden border border-outline-variant/20 transition-all duration-300 rounded-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 flex justify-between items-center border-b border-outline-variant/30 bg-surface-container-low">
          <h3 className="font-headline text-lg font-bold text-on-surface">
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
        <form onSubmit={handleSubmit} className="overflow-y-auto overflow-x-hidden flex-1">
          <div className="p-6 space-y-4">
            {/* Title */}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Habit Name *
            </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Write 500 words"
                className="w-full bg-transparent border-b-2 border-outline-variant focus:border-primary focus:ring-0 px-1 py-1.5 text-sm font-headline text-on-surface outline-none transition-colors"
              />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Description / Goal
            </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. 30 minutes • Morning routine"
                className="w-full bg-transparent border-b-2 border-outline-variant focus:border-primary focus:ring-0 px-1 py-1.5 text-sm font-headline text-on-surface outline-none transition-colors"
              />
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
                className="w-full text-sm py-2 px-3 border outline-none bg-white border-outline-variant rounded-lg font-headline focus:border-primary"
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
                className="w-full text-sm py-2 px-3 border outline-none bg-white border-outline-variant rounded-lg font-headline focus:border-primary"
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>
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
                    className={`flex flex-col items-center justify-center p-2 border transition-all rounded-lg ${
                      isSelected
                        ? 'bg-secondary-container border-primary text-primary font-bold'
                        : 'border-outline-variant hover:bg-surface-container-low text-on-surface-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">{i.name}</span>
                  </button>
                );
              })}
              {/* Default fallback checklist option */}
              <button
                type="button"
                onClick={() => setIcon('checklist')}
                className={`flex flex-col items-center justify-center p-2 border transition-all rounded-lg ${
                  icon === 'checklist'
                    ? 'bg-secondary-container border-primary text-primary font-bold'
                    : 'border-outline-variant hover:bg-surface-container-low text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-lg">checklist</span>
              </button>
            </div>
          </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 pt-4 border-t border-outline-variant/20 bg-surface flex items-center justify-end gap-3 sticky bottom-0">
            {habit && (
              <button
                type="button"
                onClick={handleDelete}
                className="mr-auto px-4 py-2 border border-error text-error text-xs font-bold transition-all rounded-lg hover:bg-error/5 active:scale-95"
              >
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold transition-all border border-outline text-on-surface-variant rounded-lg hover:bg-surface-container-low active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white transition-all shadow-md bg-primary rounded-lg hover:bg-primary/95 active:scale-95"
            >
              {habit ? 'Save Changes' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

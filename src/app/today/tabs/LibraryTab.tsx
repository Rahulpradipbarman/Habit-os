import React from 'react';
import { Habit } from '@/context/AppContext';

interface LibraryTabProps {
  handleUsePreset: (title: string, desc: string, category: string, icon: string, freq: string) => void;
  handleOpenEditModal: (habit: Habit | null) => void;
  isActive: boolean;
}

export const LibraryTab = React.memo(function LibraryTab({ handleUsePreset, handleOpenEditModal, isActive }: LibraryTabProps) {
  return (
    <div className={`p-6 lg:p-16 flex-1 ${isActive ? 'block' : 'hidden'}`}>
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="font-headline text-3xl font-extrabold text-on-surface">Habit Library</h2>
          <p className="text-sm text-on-surface-variant font-medium mt-1">Explore presets or manage your templates</p>
        </div>
        <button 
          onClick={() => handleOpenEditModal(null)}
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
  );
});

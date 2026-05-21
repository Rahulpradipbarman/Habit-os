'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import SidebarLayout from '@/components/SidebarLayout';
import { updateSettingsAction, deleteUserAction } from '@/app/actions/habitActions';
import { logout } from '@/app/actions/auth';

interface SettingsClientProps {
  userId: string;
  initialName: string;
  initialReminderTime: string | null;
}

export default function SettingsClient({ userId, initialName, initialReminderTime }: SettingsClientProps) {
  const { theme, setTheme } = useApp();
  const [userName, setUserName] = useState(initialName);
  const [notifications, setNotifications] = useState(!!initialReminderTime);
  const [goalCount, setGoalCount] = useState(4);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const reminderTimeValue = notifications ? (initialReminderTime || '08:00') : null;
      await updateSettingsAction(userId, {
        name: userName,
        reminder_time: reminderTimeValue
      });
      alert('Settings saved successfully!');
    } catch (err: any) {
      alert(`Error saving settings: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to delete all your habits and data? This cannot be undone.')) {
      setLoading(true);
      try {
        localStorage.clear();
        await deleteUserAction(userId);
        window.location.href = '/login';
      } catch (err: any) {
        alert(`Error deleting account: ${err.message}`);
        setLoading(false);
      }
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
    } catch (err: any) {
      alert(`Error logging out: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="p-6 lg:p-16 max-w-2xl">
        <header className="mb-8">
          <h2 className="font-headline text-3xl font-extrabold text-on-surface">Settings</h2>
          <p className="text-sm text-on-surface-variant font-medium mt-1">Configure your personal Habit OS interface</p>
        </header>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Interface Style Toggle */}
          <div className="bg-white p-6 rounded-xl habit-card-shadow border border-outline-variant/20">
            <h4 className="font-headline font-bold text-base text-on-surface mb-4">Interface Style</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setTheme('calm')}
                className={`p-4 border text-left rounded-xl transition-all ${
                  theme === 'calm'
                    ? 'border-primary bg-secondary-container/20 text-primary font-bold shadow-sm'
                    : 'border-outline-variant/30 hover:bg-surface-container-low text-on-surface-variant'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-lg">spa</span>
                  <span className="font-headline font-bold text-sm">Calm Authority</span>
                </div>
                <p className="text-[10px] opacity-80 leading-relaxed font-normal">Minimalist teal tone slate grid suited for focused structure.</p>
              </button>

              <button
                type="button"
                onClick={() => setTheme('vibrant')}
                className={`p-4 border text-left rounded-xl transition-all ${
                  theme === 'vibrant'
                    ? 'border-primary bg-primary-container/10 text-primary font-bold shadow-sm'
                    : 'border-outline-variant/30 hover:bg-surface-container-low text-on-surface-variant'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-lg">bolt</span>
                  <span className="font-headline font-bold text-sm">Vibrant Momentum</span>
                </div>
                <p className="text-[10px] opacity-80 leading-relaxed font-normal">Bouncy bento layouts, corals, mint buttons, and XP milestone metrics.</p>
              </button>
            </div>
          </div>

          {/* Profile settings */}
          <div className="bg-white p-6 rounded-xl habit-card-shadow border border-outline-variant/20 space-y-4">
            <h4 className="font-headline font-bold text-base text-on-surface">User Profile</h4>
            
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Display Name</label>
              <input 
                type="text" 
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className={`w-full text-sm px-3 py-2 border outline-none bg-white ${
                  theme === 'calm' 
                    ? 'border-outline-variant rounded-lg focus:border-primary' 
                    : 'border-transparent bg-surface-container-low rounded-lg focus:border-primary focus:bg-white'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Daily Goal Threshold (habits)</label>
              <input 
                type="number" 
                min="1"
                value={goalCount}
                onChange={(e) => setGoalCount(parseInt(e.target.value) || 1)}
                className={`w-full text-sm px-3 py-2 border outline-none bg-white ${
                  theme === 'calm' 
                    ? 'border-outline-variant rounded-lg focus:border-primary' 
                    : 'border-transparent bg-surface-container-low rounded-lg focus:border-primary focus:bg-white'
                }`}
              />
            </div>
          </div>

          {/* Notification settings */}
          <div className="bg-white p-6 rounded-xl habit-card-shadow border border-outline-variant/20 flex items-center justify-between">
            <div>
              <h4 className="font-headline font-bold text-base text-on-surface">Reminder Notifications</h4>
              <p className="text-xs text-on-surface-variant mt-1">Receive daily sound alerts to check off routines</p>
            </div>
            
            <button 
              type="button"
              onClick={() => setNotifications(!notifications)}
              className={`w-12 h-6 rounded-full p-1 transition-all ${
                notifications ? 'bg-primary' : 'bg-outline-variant'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                notifications ? 'translate-x-6' : 'translate-x-0'
              }`}></div>
            </button>
          </div>

          {/* Save & Reset buttons */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={handleReset}
                disabled={loading}
                className={`px-4 py-2 border text-xs font-bold transition-all disabled:opacity-50 ${
                  theme === 'calm'
                    ? 'border-error text-error rounded-lg hover:bg-error/5 active:scale-95'
                    : 'border-error text-error rounded-full hover:bg-error/5 hover:scale-102 active:scale-95'
                }`}
              >
                Reset Data
              </button>

              <button 
                type="button" 
                onClick={handleLogout}
                disabled={loading}
                className={`px-4 py-2 border text-xs font-bold transition-all disabled:opacity-50 ${
                  theme === 'calm'
                    ? 'border-outline-variant text-on-surface rounded-lg hover:bg-surface-container-low active:scale-95'
                    : 'border-outline-variant text-on-surface rounded-full hover:bg-surface-container-low hover:scale-102 active:scale-95'
                }`}
              >
                Log Out
              </button>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`px-6 py-2.5 text-xs font-bold text-white transition-all shadow-md disabled:opacity-50 ${
                theme === 'calm'
                  ? 'bg-primary rounded-lg hover:opacity-95 active:scale-95'
                  : 'bg-primary rounded-full hover:scale-105 active:scale-95 shadow-[0px_5px_15px_rgba(255,126,103,0.2)]'
              }`}
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </SidebarLayout>
  );
}

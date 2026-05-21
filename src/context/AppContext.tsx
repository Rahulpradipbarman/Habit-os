'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Habit {
  id: string;
  title: string;
  description: string;
  category: 'Morning' | 'Afternoon' | 'Evening' | 'All day';
  icon: string;
  streak: number;
  completed: boolean;
  frequency: string;
}

export type ThemeType = 'calm' | 'vibrant';

interface AppContextProps {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  // These are kept for InsightBanner's fallback display
  habits: Habit[];
  currentStreak: number;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>('calm');
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Load theme from localStorage on client mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('habit-os-theme') as ThemeType;
    if (savedTheme === 'calm' || savedTheme === 'vibrant') {
      setThemeState(savedTheme);
      document.documentElement.className = savedTheme === 'vibrant' ? 'theme-vibrant' : 'light';
    }
  }, []);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    localStorage.setItem('habit-os-theme', newTheme);
    document.documentElement.className = newTheme === 'vibrant' ? 'theme-vibrant' : 'light';
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        activeTab,
        setActiveTab,
        // Empty defaults — the real data comes from Supabase via server components
        habits: [],
        currentStreak: 0,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

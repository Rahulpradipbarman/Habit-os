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

interface AppContextProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  // These are kept for InsightBanner's fallback display
  habits: Habit[];
  currentStreak: number;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  useEffect(() => {
    document.documentElement.className = 'light';
  }, []);

  return (
    <AppContext.Provider
      value={{
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

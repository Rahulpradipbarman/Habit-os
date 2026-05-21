'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

interface SidebarLayoutProps {
  children: React.ReactNode;
  onAddHabitClick?: () => void;
}

export default function SidebarLayout({ children, onAddHabitClick }: SidebarLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, activeTab, setActiveTab } = useApp();

  const isSettings = pathname === '/settings';
  const isToday = pathname === '/today' || pathname === '/';

  const navigateToTab = (tabName: string) => {
    setActiveTab(tabName);
    if (isSettings) {
      router.push('/today');
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'library', label: 'Habit Library', icon: 'list_alt' },
    { id: 'analytics', label: 'Analytics', icon: 'insights' },
    { id: 'community', label: 'Community', icon: 'groups' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* =========================================================================
          SIDEBAR NAVIGATION (DESKTOP)
          ========================================================================= */}
      
      {/* Calm Authority Sidebar */}
      {theme === 'calm' && (
        <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-low flex flex-col p-6 gap-2 border-r border-outline-variant/30 z-30 hidden md:flex">
          <div className="mb-8 px-1">
            <h1 className="font-headline text-2xl font-extrabold text-primary tracking-tight">Habit OS</h1>
            <p className="text-xs text-on-surface-variant font-medium tracking-wide">Master your routine</p>
          </div>
          <nav className="flex-grow flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = isToday && activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateToTab(item.id)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-left ${
                    isActive
                      ? 'text-primary font-bold bg-secondary-container shadow-sm'
                      : 'text-on-surface-variant font-medium hover:bg-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                    {item.icon}
                  </span>
                  <span className="text-sm font-headline">{item.label}</span>
                </button>
              );
            })}
            <Link
              href="/settings"
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                isSettings
                  ? 'text-primary font-bold bg-secondary-container shadow-sm'
                  : 'text-on-surface-variant font-medium hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isSettings ? "'FILL' 1" : "'FILL' 0" }}>
                settings
              </span>
              <span className="text-sm font-headline">Settings</span>
            </Link>
          </nav>

          {/* Theme Toggle in Sidebar */}
          <div className="mb-4 p-3 bg-surface-container-high/50 rounded-xl flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">Theme</span>
            <button
              onClick={() => setTheme('vibrant')}
              className="flex items-center gap-1 bg-surface-container-lowest px-2 py-1 rounded-lg border border-outline-variant shadow-sm active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-sm text-primary">swap_horiz</span>
              <span className="text-[10px] font-bold text-primary uppercase">Calm</span>
            </button>
          </div>

          <div className="p-4 bg-primary-container rounded-xl text-on-primary-container">
            <p className="text-[10px] font-extrabold uppercase tracking-wider mb-1">PRO ACCOUNT</p>
            <p className="text-xs mb-3 leading-relaxed opacity-90">Unlock advanced analytics and cloud sync.</p>
            <button className="w-full bg-white text-primary font-bold py-1.5 rounded-lg hover:bg-opacity-90 active:scale-95 transition-all text-xs shadow-sm">
              Upgrade to Pro
            </button>
          </div>
        </aside>
      )}

      {/* Vibrant Momentum Sidebar */}
      {theme === 'vibrant' && (
        <aside className="fixed left-0 top-0 h-full hidden md:flex flex-col py-6 gap-2 bg-surface-container-lowest border-r border-outline-variant shadow-[0px_10px_30px_rgba(255,126,103,0.05)] w-64 z-50">
          <div className="px-6 flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-md">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                rocket_launch
              </span>
            </div>
            <div>
              <h1 className="font-headline text-lg font-black text-primary leading-none">Habit OS</h1>
              <p className="text-[10px] font-bold text-on-surface-variant tracking-wide uppercase">Stay consistent</p>
            </div>
          </div>
          
          <nav className="flex-1 flex flex-col gap-1 px-2">
            {navItems.map((item) => {
              const isActive = isToday && activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateToTab(item.id)}
                  className={`flex items-center gap-4 py-2.5 px-4 rounded-full font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-left ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container font-extrabold shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                    {item.icon}
                  </span>
                  <span className="text-sm font-headline">{item.label}</span>
                </button>
              );
            })}
            
            <Link
              href="/settings"
              className={`flex items-center gap-4 py-2.5 px-4 rounded-full font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                isSettings
                  ? 'bg-primary-container text-on-primary-container font-extrabold shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isSettings ? "'FILL' 1" : "'FILL' 0" }}>
                settings
              </span>
              <span className="text-sm font-headline">Settings</span>
            </Link>
          </nav>

          <div className="px-6 mb-4">
            <button
              onClick={onAddHabitClick}
              className="w-full py-3 bg-primary text-on-primary rounded-full font-bold shadow-[0px_5px_15px_rgba(255,126,103,0.3)] hover:scale-105 transition-transform active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              <span className="text-sm">New Habit</span>
            </button>
          </div>

          <div className="mt-auto flex flex-col gap-1 border-t border-outline-variant pt-4 px-2">
            {/* Theme Toggle */}
            <div className="px-4 py-2 flex items-center justify-between text-xs text-on-surface-variant">
              <span className="font-semibold">Style Mode</span>
              <button
                onClick={() => setTheme('calm')}
                className="flex items-center gap-1 bg-primary text-on-primary px-2.5 py-1 rounded-full font-bold shadow-sm active:scale-95 transition-transform hover:opacity-90"
              >
                <span className="material-symbols-outlined text-[12px] text-white">style</span>
                <span className="text-[9px] uppercase">Vibrant</span>
              </button>
            </div>
            
            <button className="flex items-center gap-4 py-2 px-4 text-on-surface-variant hover:bg-surface-variant rounded-full font-medium hover:scale-102 transition-all text-left">
              <span className="material-symbols-outlined">help</span>
              <span className="text-sm font-headline">Support</span>
            </button>
          </div>
        </aside>
      )}

      {/* =========================================================================
          MAIN CANVAS CONTAINER
          ========================================================================= */}
      <div className={`flex-1 flex flex-col ${theme === 'calm' ? 'md:ml-64' : 'md:ml-64'} pb-20 md:pb-0`}>
        {children}
      </div>

      {/* =========================================================================
          MOBILE BOTTOM NAVIGATION
          ========================================================================= */}
      
      {/* Calm Mobile Nav */}
      {theme === 'calm' && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface h-16 flex items-center justify-around shadow-[0_-2px_10px_rgba(0,0,0,0.05)] px-4 z-30 border-t border-outline-variant/30">
          <button
            onClick={() => navigateToTab('dashboard')}
            className={`flex flex-col items-center gap-0.5 ${activeTab === 'dashboard' && isToday ? 'text-primary font-bold' : 'text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'dashboard' && isToday ? "'FILL' 1" : "'FILL' 0" }}>
              dashboard
            </span>
            <span className="text-[10px] font-bold">Dashboard</span>
          </button>
          
          <button
            onClick={() => navigateToTab('library')}
            className={`flex flex-col items-center gap-0.5 ${activeTab === 'library' && isToday ? 'text-primary font-bold' : 'text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'library' && isToday ? "'FILL' 1" : "'FILL' 0" }}>
              event_repeat
            </span>
            <span className="text-[10px] font-medium">Habits</span>
          </button>

          <div className="relative -top-4">
            <button
              onClick={onAddHabitClick}
              className="w-12 h-12 bg-primary text-white rounded-full shadow-md flex items-center justify-center active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-xl">add</span>
            </button>
          </div>

          <button
            onClick={() => navigateToTab('analytics')}
            className={`flex flex-col items-center gap-0.5 ${activeTab === 'analytics' && isToday ? 'text-primary font-bold' : 'text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'analytics' && isToday ? "'FILL' 1" : "'FILL' 0" }}>
              insights
            </span>
            <span className="text-[10px] font-medium">Stats</span>
          </button>

          <Link
            href="/settings"
            className={`flex flex-col items-center gap-0.5 ${isSettings ? 'text-primary font-bold' : 'text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: isSettings ? "'FILL' 1" : "'FILL' 0" }}>
              settings
            </span>
            <span className="text-[10px] font-medium">Settings</span>
          </Link>
        </nav>
      )}

      {/* Vibrant Mobile Nav */}
      {theme === 'vibrant' && (
        <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-surface-container-lowest border-t border-outline-variant flex justify-around py-2 px-4 z-50 shadow-[0_-5px_15px_rgba(255,126,103,0.04)]">
          <button
            onClick={() => navigateToTab('dashboard')}
            className={`flex flex-col items-center gap-0.5 ${activeTab === 'dashboard' && isToday ? 'text-primary font-bold' : 'text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'dashboard' && isToday ? "'FILL' 1" : "'FILL' 0" }}>
              dashboard
            </span>
            <span className="text-[10px] font-bold">Dash</span>
          </button>
          
          <button
            onClick={() => navigateToTab('library')}
            className={`flex flex-col items-center gap-0.5 ${activeTab === 'library' && isToday ? 'text-primary font-bold' : 'text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'library' && isToday ? "'FILL' 1" : "'FILL' 0" }}>
              list_alt
            </span>
            <span className="text-[10px]">Habits</span>
          </button>

          <button
            onClick={onAddHabitClick}
            className="-mt-7 w-12 h-12 bg-primary text-on-primary rounded-full shadow-[0px_4px_10px_rgba(255,126,103,0.3)] flex items-center justify-center active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[24px]">add</span>
          </button>

          <button
            onClick={() => navigateToTab('analytics')}
            className={`flex flex-col items-center gap-0.5 ${activeTab === 'analytics' && isToday ? 'text-primary font-bold' : 'text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'analytics' && isToday ? "'FILL' 1" : "'FILL' 0" }}>
              insights
            </span>
            <span className="text-[10px]">Stats</span>
          </button>

          <Link
            href="/settings"
            className={`flex flex-col items-center gap-0.5 ${isSettings ? 'text-primary font-bold' : 'text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: isSettings ? "'FILL' 1" : "'FILL' 0" }}>
              settings
            </span>
            <span className="text-[10px]">Settings</span>
          </Link>
        </nav>
      )}
    </div>
  );
}

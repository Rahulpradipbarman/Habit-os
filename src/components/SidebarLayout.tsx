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
  const { activeTab, setActiveTab } = useApp();

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
      
      {/* Sidebar Navigation */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-low flex flex-col p-6 gap-2 border-r border-outline-variant/30 z-30 hidden md:flex">
          <div className="mb-8 px-1">
            <Link href="/" className="hover:opacity-80 transition-opacity inline-block">
              <h1 className="font-headline text-2xl font-extrabold text-primary tracking-tight">Habit OS</h1>
            </Link>
            <p className="text-xs text-on-surface-variant font-medium tracking-wide mt-1">Master your routine</p>
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

        </aside>

      {/* =========================================================================
          MAIN CANVAS CONTAINER
          ========================================================================= */}
      <div className="flex-1 flex flex-col md:ml-64 pb-20 md:pb-0">
        {children}
      </div>

      {/* =========================================================================
          MOBILE BOTTOM NAVIGATION
          ========================================================================= */}
      
      {/* Mobile Nav */}
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
    </div>
  );
}

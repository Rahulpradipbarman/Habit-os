'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';

interface SidebarLayoutProps {
  children: React.ReactNode;
  onAddHabitClick?: () => void;
}

export default function SidebarLayout({ children, onAddHabitClick }: SidebarLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { activeTab, setActiveTab } = useApp();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isSettings = pathname === '/settings';
  const isToday = pathname === '/today' || pathname === '/';
  
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get('tab');

  // Sync initial tab from URL if present
  useEffect(() => {
    if (tabParam && ['dashboard', 'library', 'analytics', 'community', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam, setActiveTab]);

  // Handle popstate for browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab && ['dashboard', 'library', 'analytics', 'community', 'settings'].includes(tab)) {
        setActiveTab(tab);
      } else if (pathname === '/today' || pathname === '/') {
        setActiveTab('dashboard'); // Default
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setActiveTab, pathname]);

  const handleTabClick = (e: React.MouseEvent<HTMLAnchorElement>, tabId: string) => {
    if (isToday) {
      e.preventDefault();
      setActiveTab(tabId);
      window.history.pushState(null, '', `?tab=${tabId}`);
      setIsDrawerOpen(false);
    } else {
      // Allow Link to navigate
      setActiveTab(tabId);
      setIsDrawerOpen(false);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'library', label: 'Habit Library', icon: 'list_alt' },
    { id: 'analytics', label: 'Analytics', icon: 'insights' },
    { id: 'community', label: 'Community', icon: 'groups' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* =========================================================================
          SIDEBAR NAVIGATION (DESKTOP)
          ========================================================================= */}
      
      {/* Sidebar Navigation */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-low flex flex-col p-6 gap-2 border-r border-outline-variant/30 z-30 hidden md:flex">
          <div className="mb-8 px-1">
            <Link href="/" className="hover:opacity-80 transition-opacity inline-block active:scale-95 cursor-pointer">
              <h1 className="font-headline text-2xl font-extrabold text-primary tracking-tight">Habit OS</h1>
            </Link>
            <p className="text-xs text-on-surface-variant font-medium tracking-wide mt-1">Master your routine</p>
          </div>
          <nav className="flex-grow flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = isToday && activeTab === item.id;
              return (
                <Link
                  key={item.id}
                  href={`/today?tab=${item.id}`}
                  onClick={(e) => handleTabClick(e, item.id)}
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
                </Link>
              );
            })}
          </nav>

        </aside>

      {/* =========================================================================
          MOBILE DRAWER NAVIGATION
          ========================================================================= */}
      
      {/* Mobile Header (Top Bar) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-surface border-b border-outline-variant/30 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 text-on-surface hover:bg-surface-container rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <Link href="/" className="hover:opacity-80 active:scale-95 transition-all cursor-pointer">
            <h1 className="font-headline text-xl font-extrabold text-primary tracking-tight">Habit OS</h1>
          </Link>
        </div>
        {onAddHabitClick && (
          <button
            onClick={onAddHabitClick}
            className="w-10 h-10 bg-primary text-white rounded-full shadow-sm flex items-center justify-center active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-xl">add</span>
          </button>
        )}
      </div>

      {/* Mobile Drawer Overlay */}
      {isDrawerOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Mobile Drawer Panel */}
      <aside className={`md:hidden fixed left-0 top-0 bottom-0 w-64 bg-surface-container-low flex flex-col p-6 gap-2 z-50 transform transition-transform duration-300 ease-in-out ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center mb-8 px-1">
          <Link href="/" onClick={() => setIsDrawerOpen(false)} className="hover:opacity-80 active:scale-95 transition-all block cursor-pointer text-left">
            <h1 className="font-headline text-2xl font-extrabold text-primary tracking-tight">Habit OS</h1>
            <p className="text-xs text-on-surface-variant font-medium tracking-wide mt-1">Master your routine</p>
          </Link>
          <button 
            onClick={() => setIsDrawerOpen(false)}
            className="p-2 text-on-surface hover:bg-surface-container rounded-full"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <nav className="flex-grow flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = isToday && activeTab === item.id;
            return (
              <Link
                key={item.id}
                href={`/today?tab=${item.id}`}
                onClick={(e) => handleTabClick(e, item.id)}
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
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* =========================================================================
          MAIN CANVAS CONTAINER
          ========================================================================= */}
      <div className="flex-1 flex flex-col md:ml-64 pt-16 md:pt-0">
        {children}
      </div>


    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

export default function Home() {
  const { theme, setTheme } = useApp();

  return (
    <div className={`min-h-screen bg-background text-on-background font-sans transition-colors duration-300`}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-outline-variant/10">
        <nav className="flex justify-between items-center w-full px-6 py-4 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl font-bold">rocket_launch</span>
            <span className="font-headline text-lg font-black text-primary">Habit OS</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a className="text-xs font-bold text-primary border-b-2 border-primary pb-0.5" href="#">Home</a>
            <Link className="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors" href="/login">Habit Library</Link>
            <Link className="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors" href="/login">Community</Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Theme Switcher */}
            <button 
              onClick={() => setTheme(theme === 'calm' ? 'vibrant' : 'calm')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-outline-variant bg-surface-container-lowest text-primary font-bold hover:bg-surface-container shadow-sm active:scale-95 transition-all text-xs"
              title="Toggle design style"
            >
              <span className="material-symbols-outlined text-sm">style</span>
              <span className="text-[10px] uppercase tracking-wide hidden sm:inline">
                {theme === 'calm' ? 'Vibrant theme' : 'Calm theme'}
              </span>
            </button>

            <Link 
              href="/login" 
              className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-full shadow-sm hover:opacity-95 active:scale-95 transition-all"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Canvas */}
      <main className="max-w-[1440px] mx-auto px-6 md:px-16 py-12 md:py-20 space-y-16 md:space-y-28">
        
        {/* Hero Section */}
        <section className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
          <div className="flex-1 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 bg-secondary-container/20 text-on-secondary-container px-3 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-wider border border-secondary-container/30">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
              <span>NEW SEASON LIVE</span>
            </div>
            
            <h1 className="font-headline text-4xl lg:text-6xl font-black text-on-surface tracking-tight leading-tight">
              Master your routine, <span className="text-primary italic">the fun way.</span>
            </h1>
            
            <p className="text-sm lg:text-base text-on-surface-variant max-w-xl leading-relaxed">
              Turn your daily goals into a game you love to play. Level up your health, focus, and happiness with the world's most tactile habit tracker.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link 
                href="/login"
                className="px-8 py-3 bg-primary text-white rounded-full font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
              >
                Get Started Free
              </Link>
              <a 
                href="#how-it-works"
                className="px-6 py-3 bg-surface-container-high text-on-surface rounded-full font-bold text-xs hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 border border-outline-variant/30"
              >
                <span className="material-symbols-outlined text-lg">play_circle</span>
                How it Works
              </a>
            </div>
          </div>

          {/* Hero Illustration / Bento Hybrid */}
          <div className="flex-1 relative w-full aspect-square md:aspect-auto md:h-[460px] max-w-[500px]">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-container/10 to-secondary-container/10 rounded-2xl border border-outline-variant/20"></div>
            
            {/* Bento Mockup Elements Grid */}
            <div className="absolute inset-4 grid grid-cols-6 grid-rows-6 gap-3">
              
              {/* Card 1: Streak Count */}
              <div className="col-span-4 row-span-3 bg-white rounded-xl p-5 shadow-md flex flex-col justify-between border border-outline-variant/10">
                <div className="flex justify-between items-center">
                  <span className="material-symbols-outlined text-primary p-1 bg-primary/15 rounded-full text-base">local_fire_department</span>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">STREAK</span>
                </div>
                <div className="mt-2">
                  <div className="font-headline text-3xl font-extrabold text-on-surface">14</div>
                  <div className="text-[10px] text-on-surface-variant font-medium">Days consistent</div>
                </div>
              </div>

              {/* Card 2: Drink Water Habit */}
              <div className="col-span-2 row-span-2 bg-secondary-container text-on-secondary-container rounded-xl p-3 shadow-sm flex flex-col items-center justify-center gap-1 text-center">
                <span className="material-symbols-outlined text-2xl">water_drop</span>
                <span className="text-[9px] font-bold tracking-tight">Drink Water</span>
              </div>

              {/* Card 3: Meditate Habit */}
              <div className="col-span-2 row-span-2 bg-tertiary-container/30 text-on-tertiary-container rounded-xl p-3 shadow-sm flex flex-col items-center justify-center gap-1 text-center">
                <span className="material-symbols-outlined text-2xl">self_improvement</span>
                <span className="text-[9px] font-bold tracking-tight">Meditate</span>
              </div>

              {/* Card 4: Progress Ring */}
              <div className="col-span-3 row-span-3 bg-white rounded-xl p-4 shadow-md flex flex-col items-center justify-center border border-outline-variant/10">
                <div className="relative w-18 h-18">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle className="text-surface-container-high" cx="36" cy="36" fill="transparent" r="30" stroke="currentColor" strokeWidth="6"></circle>
                    <circle className="text-secondary rounded-full" cx="36" cy="36" fill="transparent" r="30" stroke="currentColor" strokeDasharray="188.4" strokeDashoffset="47.1" strokeWidth="6"></circle>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-headline font-bold text-xs text-on-surface">75%</div>
                </div>
                <span className="mt-2 text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Today's Goal</span>
              </div>

              {/* Card 5: Points Total */}
              <div className="col-span-3 row-span-1 bg-primary text-white rounded-xl flex items-center justify-center gap-1.5 p-2 shadow-sm">
                <span className="material-symbols-outlined text-sm">stars</span>
                <span className="text-[9px] font-bold uppercase tracking-wider">340 Points Today</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Section */}
        <section className="py-8 space-y-12" id="how-it-works">
          <div className="text-center space-y-3">
            <h2 className="font-headline text-3xl font-black text-on-surface">Built for Momentum</h2>
            <p className="text-sm text-on-surface-variant max-w-lg mx-auto leading-relaxed">
              Traditional habit trackers feel like a chore. Habit OS feels like a victory lap every single day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Card 1: Gamified Tracking */}
            <div className="md:col-span-5 bg-white p-6 rounded-2xl shadow-md border border-outline-variant/10 flex flex-col gap-6">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">videogame_asset</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-headline text-lg font-bold text-on-surface">Level Up Your Life</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Earn XP for every completed task. Join seasonal challenges and compete with friends to see who can maintain the longest streaks.
                </p>
              </div>
              
              <div className="mt-auto bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-on-surface">Level 14 Trailblazer</span>
                  <span className="text-[9px] font-bold text-primary">2,450 / 3,000 XP</span>
                </div>
                <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-primary" style={{ width: '80%' }}></div>
                </div>
              </div>
            </div>

            {/* Card 2: Visual Progress */}
            <div className="md:col-span-7 bg-white p-6 rounded-2xl shadow-md border border-outline-variant/10 flex flex-col md:flex-row gap-6 overflow-hidden">
              <div className="flex-1 space-y-4">
                <div className="w-10 h-10 bg-secondary/15 text-secondary rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">insights</span>
                </div>
                <div className="space-y-1">
                  <h3 className="font-headline text-lg font-bold text-on-surface">Tactile Analytics</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                    Beautiful, interactive visualizations that show your growth over time. No more boring spreadsheets.
                  </p>
                </div>
              </div>

              <div className="flex-1 bg-surface-container-low rounded-xl p-4 flex items-end gap-1.5 h-44 md:h-full min-h-[160px] border border-outline-variant/20">
                <div className="flex-1 bg-secondary rounded-t-full transition-all duration-700" style={{ height: '40%' }}></div>
                <div className="flex-1 bg-secondary rounded-t-full transition-all duration-700" style={{ height: '60%' }}></div>
                <div className="flex-1 bg-secondary rounded-t-full transition-all duration-700" style={{ height: '90%' }}></div>
                <div className="flex-1 bg-secondary rounded-t-full transition-all duration-700" style={{ height: '75%' }}></div>
                <div className="flex-1 bg-secondary rounded-t-full transition-all duration-700" style={{ height: '85%' }}></div>
                <div className="flex-1 bg-primary rounded-t-full transition-all duration-700" style={{ height: '100%' }}></div>
              </div>
            </div>

            {/* Card 3: Community */}
            <div className="md:col-span-12 bg-surface-container-low p-6 rounded-2xl border border-outline-variant/20 flex flex-col md:flex-row items-center gap-6">
              <div className="md:w-1/2 space-y-4">
                <div className="w-10 h-10 bg-tertiary-container/30 text-on-tertiary-container rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">groups</span>
                </div>
                <h3 className="font-headline text-xl font-black text-on-surface">Find Your Tribe</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                  Connect with thousands of others building the same habits. Share tips, stay accountable, and celebrate milestones together in a guilt-free environment.
                </p>
                <Link 
                  href="/login"
                  className="text-xs font-bold text-primary flex items-center gap-1 group hover:underline"
                >
                  Explore Communities
                  <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </Link>
              </div>

              <div className="md:w-1/2 flex -space-x-3 overflow-hidden py-4 justify-center md:justify-end">
                <img className="inline-block h-12 w-12 rounded-full ring-4 ring-white" alt="Community Member" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxUHRe0_K-Px1jLed_XfYFr0GW1_6jEQIIaNC_eUqxHW8DNFRrSrUXS0MIqA8jzMGsu4otucgtIxcmU1UmL-ssk_dfJqwVPrxe03lUeBq0ECVcCaLw68mq8pKc2YbFaDD7_N93h6cIZ0XWptrC1CEiYN6U_i6DMd2B38mvGzKbWq9V3i46mAnIjnw1WTFYqtEzfrZbniLNsOeTr--FxVCDSxtaB-yFhFkpp5Jp3Mni8jvzTXuZ8T8J0qHU3_7ZPnrMyocTCqu28m4"/>
                <img className="inline-block h-12 w-12 rounded-full ring-4 ring-white" alt="Community Member" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLd-R6BYftVTXXai2C1XZmqxEiGyvsjVH_Y71xMFflNEMZPOyv3qwXc38CHcenor0wlJ5xwe7ya4ueo3_L0LDORrubuL_SnaFhN3w9iy5asUap-61nVjZxBRcj6YqNR5icxKgcjj-BVn1JVd0Yog2nUoq1MsKKeoBpQHBFl63Mk5iylqW18_Kxwh_dfvBuUboegPhSbFr4sYh8IO4Tq4lwU2JF-sWV75tVZ7afrPyaI1Dw98d3sZv49EghRLwLbclu0JEAqBFPfH0"/>
                <img className="inline-block h-12 w-12 rounded-full ring-4 ring-white" alt="Community Member" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2u_Hyv6gWuSMLcYxt8sQ3yyL4GEGYhFWk-nlf-DlolOICmHVYkBPSzcW8rmZ82tdBeg-xdp7vBJDOyB7e6p9RLcnufSVnROOef9txos61quCjF1c2u_BaRZUJlzhZwCt4GmxhXmjgeeqZc67CU6diMNkQoN6faYXuaiOef4i_DQIykK37ukLraAzaFZZk4GKBos2mpSX5FuxqxzgVTQHYBEq3VBEy6dw4LHdRmh7RdKDtVFqrWdKQ7DesxhJ_DZmCC8YB-kG9HIc"/>
                <img className="inline-block h-12 w-12 rounded-full ring-4 ring-white" alt="Community Member" src="https://lh3.googleusercontent.com/aida-public/AB6AXuANipRWd07j_xq77Knh5QaFeHkrGBtPhNtGm5nlb1_O0aVwgFesacezS1wS4IOJhxcyjBCV-82HqgXkepgdUHIzTpmmKR16Ridfma4Bm5aOVRDvchZ0QkmOupMcj4Ki36yuIQxxOIXbKSnwJc4YItfVpWyDJHWTdgRSx8ORpbi598Hc_TDsKYzyEyIzTxd0D7TnYXAhJeAcyDoFyBwbfHnEhViyW9cb2dh0qJ_r8C42uevQ5RHWx0zpflQT1CDPPM3M2Teh5aySQz0"/>
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full ring-4 ring-white bg-primary text-white font-extrabold text-xs">+2k</div>
              </div>
            </div>

          </div>
        </section>

        {/* CTA Section */}
        <section className="py-8">
          <div className="bg-primary text-white rounded-2xl p-8 md:p-12 text-center flex flex-col items-center gap-6 relative overflow-hidden shadow-lg">
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-secondary/15 rounded-full blur-3xl"></div>
            
            <h2 className="font-headline text-3xl md:text-4xl font-extrabold max-w-2xl relative z-10">
              Ready to turn your goals into a lifestyle?
            </h2>
            
            <p className="text-xs md:text-sm text-white/80 max-w-md relative z-10 leading-relaxed font-medium">
              Join over 50,000+ habit builders creating momentum every day. Start your 14-day free trial today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 relative z-10 w-full justify-center max-w-xs">
              <Link 
                href="/login"
                className="px-6 py-2.5 bg-white text-primary rounded-full font-bold text-xs hover:scale-105 active:scale-95 transition-all text-center"
              >
                Create My Routine
              </Link>
              <Link 
                href="/login"
                className="px-6 py-2.5 bg-transparent border-2 border-white/40 hover:border-white text-white rounded-full font-bold text-xs transition-all text-center"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-surface-container-high border-t border-outline-variant/30 mt-12">
        <div className="max-w-[1440px] mx-auto py-8 px-6 md:px-16 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start">
            <span className="font-headline text-lg font-black text-primary">Habit OS</span>
            <p className="text-[10px] text-on-surface-variant font-medium mt-1">© 2026 Habit OS. Build momentum daily.</p>
          </div>
          <div className="flex gap-8 text-xs font-bold text-on-surface-variant">
            <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
            <a className="hover:text-primary transition-colors" href="#">Contact Us</a>
          </div>
          <div className="flex gap-3">
            <button className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center hover:scale-110 transition-transform shadow-sm">
              <span className="material-symbols-outlined text-sm text-on-surface-variant">share</span>
            </button>
            <button className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center hover:scale-110 transition-transform shadow-sm">
              <span className="material-symbols-outlined text-sm text-on-surface-variant">thumb_up</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

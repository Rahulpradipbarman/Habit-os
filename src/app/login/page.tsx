'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { login, signup } from '@/app/actions/auth';

export default function LoginPage() {
  const router = useRouter();
  const { theme } = useApp();
  const [authType, setAuthType] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (authType === 'signin') {
        const res = await login(email, password);
        if (res && res.error) {
          setError(res.error);
        }
      } else {
        const res = await signup(email, name, password);
        if (res && res.error) {
          setError(res.error);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col bg-background text-on-background transition-colors duration-300`}>
      {/* Auth Container */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full h-auto max-w-5xl md:grid md:grid-cols-2 bg-white md:rounded-2xl md:overflow-hidden habit-card-shadow border border-outline-variant/20">
          
          {/* Left Side: Visual/Branding */}
          <section className="hidden md:flex flex-col justify-between p-12 relative overflow-hidden bg-primary text-white min-h-[500px]">
            {/* Background Overlay */}
            <div className="absolute inset-0 opacity-15">
              <img 
                alt="Productive Workspace" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXp710jV0f6BSE3s1QMVZfg1nZVl4Mc35068t030EmUmzXZZ9c33KA5GAp2X5yp8B6h2IUxAYT7KaroxIZzTeXWErOl_PmotlMYDsTXYByIMt3yJDC-nRLM2xP9GyLw2bh62YoOwkW6_qybHh14enjreCJLpTRvUDAirhEldHZ8NTh2_xZzqztVP0SyEbyZSLimpIuO-44NPeu0vD3TxAJBmRDYMNT0KmoNGsF-EBUMajTMsE32ujEXHbtB4taWQWNRUNSL28_oQ-4"
              />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-8">
                <span className="font-headline text-xl font-extrabold tracking-tight">Habit OS</span>
              </div>
              <h1 className="font-headline text-3xl font-extrabold leading-tight">
                A workspace that feels like a clean slate every morning.
              </h1>
            </div>

            <div className="relative z-10 bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/25">
              <p className="text-sm italic leading-relaxed text-on-primary-container">
                "Habit OS didn't just change my routine; it cleared the mental fog. It's the first tool that feels like it's working with me, not for me."
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center font-bold text-primary text-xs shadow-sm">SJ</div>
                <div>
                  <p className="text-xs font-bold">Sarah Jenkins</p>
                  <p className="text-[10px] opacity-75">Creative Director</p>
                </div>
              </div>
            </div>
          </section>

          {/* Right Side: Interaction */}
          <section className="flex flex-col p-8 md:p-12 justify-center bg-white">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center gap-2 mb-6">
              <span className="text-primary font-headline text-xl font-bold tracking-tight">Habit OS</span>
            </div>

            {/* Toggle Selector */}
            <div className="flex bg-surface-container-low p-1 rounded-full mb-8 self-start border border-outline-variant/30">
              <button 
                onClick={() => setAuthType('signin')}
                className={`px-6 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                  authType === 'signin' 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                Sign In
              </button>
              <button 
                onClick={() => setAuthType('signup')}
                className={`px-6 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                  authType === 'signup' 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                Sign Up
              </button>
            </div>

            <div className="flex flex-col gap-6">
              {/* Dynamic Header */}
              <div>
                <h2 className="font-headline text-2xl font-extrabold text-on-surface">
                  {authType === 'signin' ? 'Welcome back' : 'Start your journey'}
                </h2>
                <p className="text-xs text-on-surface-variant mt-1">
                  {authType === 'signin' ? 'Enter your credentials to continue.' : 'Create an account to start building lasting habits.'}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {authType === 'signup' && (
                  <div className="relative">
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe" 
                      className="w-full bg-transparent border-b border-outline-variant py-2 text-sm text-on-surface focus:outline-none focus:border-primary transition-all outline-none"
                    />
                  </div>
                )}
                <div className="relative">
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" 
                    className="w-full bg-transparent border-b border-outline-variant py-2 text-sm text-on-surface focus:outline-none focus:border-primary transition-all outline-none"
                  />
                </div>
                <div className="relative">
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Password</label>
                  <input 
                    type="password" 
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters" 
                    className="w-full bg-transparent border-b border-outline-variant py-2 text-sm text-on-surface focus:outline-none focus:border-primary transition-all outline-none"
                  />
                </div>

                {error && (
                  <div className="text-error text-xs font-bold bg-error/10 p-3 rounded-lg border border-error/20">
                    {error}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary text-white rounded-xl font-headline font-bold text-sm shadow-md hover:shadow-lg active:scale-95 transition-all mt-2 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : (authType === 'signin' ? 'Sign In' : 'Create Account')}
                </button>
              </form>

              <p className="text-center text-[10px] text-outline-variant leading-relaxed">
                By continuing, you agree to our <a className="text-on-surface-variant underline" href="#">Terms of Service</a> and <a className="text-on-surface-variant underline" href="#">Privacy Policy</a>.
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low border-t border-outline-variant/20 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="font-headline font-bold text-sm text-on-surface">Habit OS</p>
            <p className="text-xs text-on-surface-variant mt-1">© 2026 Habit OS. Effortless progress for high performers.</p>
          </div>
          <div className="flex flex-wrap gap-4 text-xs font-semibold text-on-surface-variant">
            <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
            <a className="hover:text-primary transition-colors" href="#">Help Center</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

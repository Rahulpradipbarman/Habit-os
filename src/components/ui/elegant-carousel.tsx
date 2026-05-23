'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SlideData {
  title: string;
  subtitle: string;
  description: string;
  accent: string;
  imageUrl: string;
}

const slides: SlideData[] = [
  {
    title: 'Build Consistency That Lasts',
    subtitle: 'Smart Daily Habit Tracking',
    description:
      'Track habits effortlessly with streak systems, local-time tracking, and intelligent daily organization designed to keep you consistent every single day.',
    accent: '#0EA5E9', // Sky blue for primary habit flow
    imageUrl:
      'https://images.unsplash.com/photo-1517842645767-c639042777db?w=900&h=1200&fit=crop&q=80',
  },
  {
    title: 'Visualize Your Progress',
    subtitle: '90-Day Analytics & Heatmaps',
    description:
      'Understand your productivity patterns through GitHub-style heatmaps, completion trends, streak insights, and long-term consistency analytics.',
    accent: '#10B981', // Emerald green for analytics
    imageUrl:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&h=1200&fit=crop&q=80',
  },
  {
    title: 'AI-Powered Personal Insights',
    subtitle: 'Intelligent Weekly Reflections',
    description:
      'Receive AI-generated summaries, productivity insights, and personalized improvement suggestions based on your real habit activity and mood trends.',
    accent: '#8B5CF6', // Purple for AI
    imageUrl:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=900&h=1200&fit=crop&q=80',
  },
  {
    title: 'Designed For Real Life',
    subtitle: 'Timezone-Aware Productivity',
    description:
      'Habit OS adapts to your local timezone automatically, ensuring streaks, daily resets, analytics, and reminders always match your real-world schedule.',
    accent: '#F59E0B', // Amber for real life
    imageUrl:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900&h=1200&fit=crop&q=80',
  },
];

export default function ElegantCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const SLIDE_DURATION = 6000;
  const TRANSITION_DURATION = 800;

  const goToSlide = useCallback(
    (index: number, dir?: 'next' | 'prev') => {
      if (isTransitioning || index === currentIndex) return;
      setDirection(dir || (index > currentIndex ? 'next' : 'prev'));
      setIsTransitioning(true);
      setProgress(0);

      setTimeout(() => {
        setCurrentIndex(index);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      }, TRANSITION_DURATION / 2);
    },
    [isTransitioning, currentIndex]
  );

  const goNext = useCallback(() => {
    const nextIndex = (currentIndex + 1) % slides.length;
    goToSlide(nextIndex, 'next');
  }, [currentIndex, goToSlide]);

  const goPrev = useCallback(() => {
    const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
    goToSlide(prevIndex, 'prev');
  }, [currentIndex, goToSlide]);

  useEffect(() => {
    if (isPaused) return;

    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 100 / (SLIDE_DURATION / 50);
      });
    }, 50);

    intervalRef.current = setInterval(() => {
      goNext();
    }, SLIDE_DURATION);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [currentIndex, isPaused, goNext]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 60) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  const currentSlide = slides[currentIndex];

  return (
    <div
      className="relative w-full max-w-6xl mx-auto rounded-[2rem] overflow-hidden bg-white border border-outline-variant/20 shadow-2xl shadow-primary/5 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background accent wash */}
      <div
        className="absolute inset-0 transition-colors duration-1000 ease-in-out pointer-events-none z-0"
        style={{
          background: `radial-gradient(circle at 80% 20%, ${currentSlide.accent}15 0%, transparent 50%)`,
        }}
      />

      <div className="flex flex-col-reverse md:flex-row min-h-[650px] md:min-h-[600px] relative z-10">
        
        {/* Left: Text Content */}
        <div className="w-full md:w-1/2 flex flex-col justify-center p-8 pb-20 md:p-16 lg:p-20 relative bg-white/40 md:bg-transparent backdrop-blur-md md:backdrop-blur-none">
          <div className="max-w-md mx-auto md:mx-0 w-full relative">
            
            {/* Collection number */}
            <div
              className={`flex items-center gap-3 mb-6 transition-all duration-500 transform ${
                isTransitioning ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'
              }`}
            >
              <span className="w-8 h-px bg-on-surface-variant/40" />
              <span className="font-headline text-xs font-bold text-on-surface-variant tracking-widest uppercase">
                {String(currentIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
              </span>
            </div>

            {/* Title */}
            <h2
              className={`font-headline text-3xl md:text-5xl font-black text-on-surface leading-tight mb-3 transition-all duration-500 delay-75 transform ${
                isTransitioning ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'
              }`}
            >
              {currentSlide.title}
            </h2>

            {/* Subtitle */}
            <p
              className={`text-sm md:text-base font-bold mb-6 transition-all duration-500 delay-100 transform ${
                isTransitioning ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'
              }`}
              style={{ color: currentSlide.accent }}
            >
              {currentSlide.subtitle}
            </p>

            {/* Description */}
            <p
              className={`text-on-surface-variant leading-relaxed mb-10 transition-all duration-500 delay-150 transform ${
                isTransitioning ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'
              }`}
            >
              {currentSlide.description}
            </p>

            {/* Navigation Arrows */}
            <div className="flex gap-4">
              <button
                onClick={goPrev}
                className="w-12 h-12 rounded-full border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary hover:bg-primary/5 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white/50 backdrop-blur-sm"
                aria-label="Previous slide"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={goNext}
                className="w-12 h-12 rounded-full border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary hover:bg-primary/5 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white/50 backdrop-blur-sm"
                aria-label="Next slide"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Image */}
        <div className="w-full md:w-1/2 relative h-[350px] md:h-auto flex-shrink-0 overflow-hidden bg-surface-container">
          <div
            className={`absolute inset-0 transition-all duration-700 transform ${
              isTransitioning 
                ? direction === 'next' ? 'translate-x-[20%] opacity-0' : '-translate-x-[20%] opacity-0' 
                : 'translate-x-0 opacity-100'
            }`}
          >
            <img
              src={currentSlide.imageUrl}
              alt={currentSlide.title}
              className="absolute inset-0 w-full h-full object-cover"
            />

          </div>
        </div>

      </div>

      {/* Progress Indicators */}
      <div className="absolute bottom-6 left-8 right-8 md:left-16 md:right-auto md:bottom-10 z-20 flex gap-2 md:gap-4 md:w-full md:max-w-md">
        {slides.map((slide, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className="group flex flex-col gap-2 flex-1 focus:outline-none"
            aria-label={`Go to slide ${index + 1}`}
          >
            <div className="h-1.5 w-full bg-surface-variant/50 rounded-full overflow-hidden relative backdrop-blur-md">
              <div
                className="absolute top-0 left-0 bottom-0 transition-all duration-[50ms] ease-linear"
                style={{
                  width: index === currentIndex ? `${progress}%` : index < currentIndex ? '100%' : '0%',
                  backgroundColor: index === currentIndex ? currentSlide.accent : index < currentIndex ? currentSlide.accent : undefined,
                  opacity: index < currentIndex ? 0.3 : 1
                }}
              />
            </div>
            <span className={`text-[10px] font-bold text-left hidden md:block transition-colors ${
              index === currentIndex ? 'text-on-surface' : 'text-on-surface-variant group-hover:text-on-surface/70'
            }`}>
              {slide.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

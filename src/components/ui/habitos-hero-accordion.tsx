'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

// --- Data for the image accordion ---
const accordionItems = [
  {
    id: 1,
    title: 'Track Habits',
    imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop', 
  },
  {
    id: 2,
    title: 'Stay Hydrated',
    imageUrl: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?q=80&w=2000&auto=format&fit=crop', 
  },
  {
    id: 3,
    title: 'Meditate Daily',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1999&auto=format&fit=crop', 
  },
  {
    id: 4,
    title: 'Read Books',
    imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=2098&auto=format&fit=crop', 
  },
  {
    id: 5,
    title: 'Deep Focus',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop', 
  },
];

// --- Accordion Item Component ---
const AccordionItem = React.memo(({ item, isActive, onMouseEnter }: { item: any, isActive: boolean, onMouseEnter: () => void }) => {
  return (
    <motion.div
      layout
      initial={false}
      // Fluid spring animation to eliminate layout thrashing
      transition={{ type: "spring", stiffness: 350, damping: 35, mass: 0.8 }}
      className={`
        relative h-full overflow-hidden cursor-pointer
        shadow-md border border-outline-variant/10
        ${isActive ? 'flex-[3] md:flex-1' : 'w-12 md:w-16 shrink-0'}
      `}
      style={{
        borderRadius: '0.75rem',
        // Force GPU acceleration
        WebkitTransform: 'translateZ(0)',
      }}
      onMouseEnter={onMouseEnter}
    >
      {/* Background Image */}
      <motion.div
        layout
        initial={false}
        animate={{ scale: isActive ? 1.05 : 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} // Optimized ease-out curve
        className="absolute inset-0 w-full h-[150%] md:h-full object-cover bg-surface-variant overflow-hidden"
        style={{ 
          transformOrigin: "center",
          willChange: "transform",
          WebkitTransform: 'translateZ(0)',
        }}
      >
        <Image src={item.imageUrl} alt={item.title} fill sizes="(max-width: 768px) 90vw, (max-width: 1200px) 40vw, 25vw" className="object-cover" />
      </motion.div>
      
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>

      {/* Caption Text */}
      <span
        className={`
          absolute text-white font-headline font-bold whitespace-nowrap flex items-center justify-center
          pointer-events-none origin-center
          ${isActive ? 'text-sm md:text-lg' : 'text-xs md:text-sm'}
        `}
        style={{
          // We use standard GPU-accelerated CSS transition here to bypass framer motion position layout complexities on text
          transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease-out, bottom 0.5s ease-out',
          willChange: 'transform, opacity, bottom',
          bottom: isActive ? '1.5rem' : '5rem',
          left: '50%',
          opacity: isActive ? 1 : 0.7,
          transform: `translateX(-50%) rotate(${isActive ? 0 : -90}deg) translateZ(0)`
        }}
      >
        {item.title}
      </span>
    </motion.div>
  );
});
AccordionItem.displayName = 'AccordionItem';

// --- Main App Component ---
export function HabitosHeroAccordion() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  // Memoize hover handler to prevent unnecessary re-renders
  const handleItemHover = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  // Hide swipe hint after scroll or timeout
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowSwipeHint(false);
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  const handleScroll = useCallback(() => {
    if (showSwipeHint) {
      setShowSwipeHint(false);
    }
  }, [showSwipeHint]);

  return (
    <>
      {/* Desktop: Hover Accordion */}
      <div className="hidden md:block flex-1 relative w-full h-[500px] max-w-[650px]">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-container/10 to-secondary-container/10 rounded-2xl border border-outline-variant/20 pointer-events-none"></div>
        
        {/* The AnimateSharedLayout pattern is inherently supported in newer framer-motion versions */}
        <div className="absolute inset-2 flex flex-row items-stretch justify-center gap-2 overflow-hidden rounded-xl">
          {accordionItems.map((item, index) => (
            <AccordionItem
              key={item.id}
              item={item}
              isActive={index === activeIndex}
              onMouseEnter={() => handleItemHover(index)}
            />
          ))}
        </div>
      </div>

      {/* Mobile: Swipeable Carousel */}
      <div className="md:hidden flex-1 relative w-full aspect-square max-w-[500px] mx-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-container/10 to-secondary-container/10 rounded-2xl border border-outline-variant/20 pointer-events-none"></div>
        
        <div 
          className="absolute inset-2 flex flex-row items-stretch gap-3 overflow-x-auto snap-x snap-mandatory rounded-xl pb-1 hide-scrollbar"
          onScroll={handleScroll}
          onTouchStart={handleScroll}
        >
          {accordionItems.map((item) => (
            <div 
              key={item.id} 
              className="relative w-[85vw] shrink-0 snap-center rounded-xl overflow-hidden shadow-md border border-outline-variant/10"
            >
              <Image 
                src={item.imageUrl} 
                alt={item.title} 
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover bg-surface-variant"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
              <span className="absolute bottom-6 left-6 text-white font-headline font-bold text-xl drop-shadow-md">
                {item.title}
              </span>
            </div>
          ))}
        </div>
        
        {/* Swipe Indicator Overlay */}
        <div className="pointer-events-none">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: showSwipeHint ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-1.5"
          >
            <motion.div 
              animate={{ x: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="bg-black/30 backdrop-blur-md border border-white/20 rounded-full w-10 h-10 flex items-center justify-center text-white shadow-lg"
            >
              <span className="material-symbols-outlined text-[22px] leading-none">arrow_forward</span>
            </motion.div>
            <span className="text-[9px] font-bold text-white uppercase tracking-wider drop-shadow-md bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
              Swipe to explore
            </span>
          </motion.div>
        </div>

        {/* Hide Scrollbar style for mobile carousel */}
        <style dangerouslySetInnerHTML={{__html: `
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}} />
      </div>
    </>
  );
}

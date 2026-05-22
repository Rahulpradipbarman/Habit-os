'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

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
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4c?q=80&w=1968&auto=format&fit=crop', 
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
      <motion.img
        layout
        src={item.imageUrl}
        alt={item.title}
        initial={false}
        animate={{ scale: isActive ? 1.05 : 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} // Optimized ease-out curve
        className="absolute inset-0 w-full h-[150%] md:h-full object-cover"
        style={{ 
          transformOrigin: "center",
          willChange: "transform",
          WebkitTransform: 'translateZ(0)',
        }}
        onError={(e) => { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).src = 'https://placehold.co/400x450/2d3748/ffffff?text=Image+Error'; }}
      />
      
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

  // Memoize hover handler to prevent unnecessary re-renders
  const handleItemHover = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  return (
    <div className="flex-1 relative w-full aspect-square md:aspect-auto md:h-[460px] max-w-[500px]">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-container/10 to-secondary-container/10 rounded-2xl border border-outline-variant/20 pointer-events-none"></div>
      
      {/* The AnimateSharedLayout pattern is inherently supported in newer framer-motion versions */}
      <div className="absolute inset-3 md:inset-4 flex flex-row items-stretch justify-center gap-2 overflow-hidden rounded-xl">
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
  );
}

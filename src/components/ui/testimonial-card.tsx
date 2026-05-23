"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// --- Type Definitions for props ---
export interface Stat {
  value: string;
  label: string;
}

export interface Testimonial {
  name: string;
  title: string;
  quote?: string;
  avatarSrc: string;
  rating: number;
}

export interface ClientsSectionProps {
  tagLabel: string;
  title: string;
  description: string;
  stats: Stat[];
  testimonials: Testimonial[];
  primaryActionLabel: string;
  secondaryActionLabel: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  className?: string;
}

// --- Internal Sub-Components ---

const StatCard = ({ value, label }: Stat) => (
  <Card className="bg-surface-container-low border-outline-variant/10 text-center rounded-2xl shadow-sm h-full">
    <CardContent className="p-4 flex flex-col justify-center h-full">
      <p className="text-2xl md:text-3xl font-black text-primary font-headline leading-none mb-1">{value}</p>
      <p className="text-[10px] md:text-xs font-bold text-on-surface-variant leading-tight">{label}</p>
    </CardContent>
  </Card>
);

const StickyTestimonialCard = ({ testimonial, index }: { testimonial: Testimonial; index: number }) => {
  return (
    <motion.div
      className="sticky w-full"
      style={{ top: `${120 + index * 24}px` }} // Staggered top position for stacking effect
    >
      <div className={cn(
        "p-6 md:p-8 rounded-[2rem] shadow-lg flex flex-col h-auto w-full",
        "bg-white border border-outline-variant/20 habit-card-shadow"
      )}>
        {/* Top section: Image and Author */}
        <div className="flex items-center gap-4">
          <Avatar className="w-14 h-14 border border-outline-variant/20 shadow-sm">
            <AvatarImage src={testimonial.avatarSrc} alt={testimonial.name} />
            <AvatarFallback>{testimonial.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <p className="font-headline font-bold text-lg text-on-surface leading-tight">{testimonial.name}</p>
            <p className="text-sm font-bold text-primary">{testimonial.title}</p>
          </div>
        </div>

        {/* Middle section: Rating */}
        <div className="flex items-center gap-2 my-5">
          <span className="font-bold text-sm text-on-surface-variant">{testimonial.rating.toFixed(1)}</span>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < Math.floor(testimonial.rating)
                    ? "text-tertiary-container fill-tertiary-container"
                    : "text-outline-variant/30 fill-outline-variant/30"
                )}
              />
            ))}
          </div>
        </div>

        {/* Bottom section: Quote */}
        {testimonial.quote && (
          <p className="text-sm md:text-base text-on-surface-variant leading-relaxed font-medium">
            &ldquo;{testimonial.quote}&rdquo;
          </p>
        )}
      </div>
    </motion.div>
  );
};

// --- Main Exported Component ---

export const ClientsSection = ({
  tagLabel,
  title,
  description,
  stats,
  testimonials,
  primaryActionLabel,
  secondaryActionLabel,
  onPrimaryAction,
  onSecondaryAction,
  className,
}: ClientsSectionProps) => {
  // We use height rather than minHeight because the scrolling effect relies on
  // the container having enough explicit vertical space to scroll through the sticky cards.
  const scrollContainerHeight = `calc(100vh + ${testimonials.length * 100}px)`;

  return (
    <section className={cn("w-full bg-background py-20 md:py-28", className)}>
      <div className="max-w-[1440px] mx-auto px-6 md:px-16 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
        
        {/* Left Column: Sticky Content */}
        <div className="flex flex-col gap-6 lg:sticky lg:top-32">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-wider self-start mb-2">
            <span className="material-symbols-outlined text-sm">groups</span>
            <span>{tagLabel}</span>
          </div>

          <h2 className="font-headline text-4xl md:text-5xl lg:text-6xl font-black text-on-surface tracking-tight leading-tight">
            {title}
          </h2>
          <p className="text-base md:text-lg text-on-surface-variant leading-relaxed max-w-lg">
            {description}
          </p>
          
          <div className="grid grid-cols-3 gap-3 md:gap-4 mt-6">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
          
          <div className="flex flex-wrap items-center gap-4 mt-8">
            <Button size="lg" onClick={onPrimaryAction}>{primaryActionLabel}</Button>
            <Button variant="outline" size="lg" onClick={onSecondaryAction}>{secondaryActionLabel}</Button>
          </div>
        </div>

        {/* Right Column: Container for the sticky card stack */}
        <div className="relative flex flex-col gap-4 pb-20" style={{ height: scrollContainerHeight }}>
          {testimonials.map((testimonial, index) => (
            <StickyTestimonialCard
              key={testimonial.name}
              index={index}
              testimonial={testimonial}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';

export interface InsightBannerProps {
  insight?: any | null;
}

export default function InsightBanner({ insight }: InsightBannerProps) {
  const { currentStreak, habits } = useApp();
  const [parsedInsight, setParsedInsight] = useState<any>(null);

  useEffect(() => {
    if (insight?.insight_data) {
      if (typeof insight.insight_data === 'string') {
        try {
          setParsedInsight(JSON.parse(insight.insight_data));
        } catch (e) {
          setParsedInsight({ summary: insight.insight_data });
        }
      } else {
        // It's already an object (JSONB native behavior)
        setParsedInsight(insight.insight_data);
      }
    }
  }, [insight]);

  if (insight === undefined) {
    return (
      <div className="animate-pulse bg-surface-container-high h-48 rounded-xl border border-outline-variant/20 flex flex-col justify-between p-6">
        <div className="space-y-3">
          <div className="h-4 bg-outline-variant/40 rounded w-1/3"></div>
          <div className="h-6 bg-outline-variant/40 rounded w-3/4"></div>
          <div className="h-4 bg-outline-variant/40 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!parsedInsight) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md border border-outline-variant/10 text-center flex flex-col items-center justify-center min-h-[200px] relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-50"></div>
        <span className="material-symbols-outlined text-4xl text-primary/40 mb-3 group-hover:scale-110 transition-transform duration-500">
          lock_open_right
        </span>
        <h4 className="font-headline text-lg font-bold text-on-surface mb-2 relative z-10">
          Insights Locked
        </h4>
        <p className="text-xs text-on-surface-variant max-w-xs relative z-10 font-medium">
          Complete habits consistently for a few more days to unlock your first AI insight ✨
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-outline-variant/10 overflow-hidden flex flex-col">
      {/* Header / Summary Section */}
      <div className="bg-primary text-white p-6 relative overflow-hidden group">
        <div className="z-10 relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
              insights
            </span>
            <p className="text-[10px] font-extrabold uppercase tracking-widest opacity-90">
              Weekly AI Insight
            </p>
          </div>
          
          <h4 className="font-headline text-xl font-bold mb-2">
            {parsedInsight.summary || "Your Weekly Summary"}
          </h4>
          <p className="text-sm opacity-90 leading-relaxed italic">
            "{parsedInsight.motivational_coaching || parsedInsight.summary}"
          </p>
        </div>
        <span 
          className="material-symbols-outlined absolute -right-6 -bottom-6 text-white opacity-[0.08] text-[120px] rotate-12 group-hover:rotate-0 transition-transform duration-700 select-none"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          lightbulb
        </span>
      </div>

      {/* Details Grid */}
      {parsedInsight.strengths && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-surface">
          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
            <div className="flex items-center gap-1.5 mb-2 text-secondary">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <h5 className="text-[10px] font-bold uppercase tracking-wider">Strengths</h5>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {parsedInsight.strengths}
            </p>
          </div>

          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
            <div className="flex items-center gap-1.5 mb-2 text-error">
              <span className="material-symbols-outlined text-sm">trending_down</span>
              <h5 className="text-[10px] font-bold uppercase tracking-wider">Areas to Improve</h5>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {parsedInsight.weaknesses}
            </p>
          </div>

          {parsedInsight.consistency_observations && (
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10 md:col-span-2">
              <div className="flex items-center gap-1.5 mb-2 text-primary">
                <span className="material-symbols-outlined text-sm">model_training</span>
                <h5 className="text-[10px] font-bold uppercase tracking-wider">Momentum & Consistency</h5>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {parsedInsight.consistency_observations} {parsedInsight.momentum_analysis}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

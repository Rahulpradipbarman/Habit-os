'use client';

import React, { Profiler, useEffect, useRef } from 'react';

// Measure hydration, render durations, and initial load times.
export default function PerformanceTracker() {
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      const hydrationTime = performance.now();
      console.log(`[PerformanceTracker] Initial Hydration Complete. Timestamp: ${hydrationTime.toFixed(2)}ms`);
      isInitialMount.current = false;
    }
  }, []);

  const onRender = (
    id: string,
    phase: "mount" | "update" | "nested-update",
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number,
  ) => {
    if (actualDuration > 5) {
      // Only log renders that take more than 5ms
      console.log(`[PerformanceTracker] Profiler: [${id}] - ${phase} took ${actualDuration.toFixed(2)}ms (Base: ${baseDuration.toFixed(2)}ms)`);
    }
  };

  return (
    <Profiler id="TodayClientRoot" onRender={onRender}>
      {/* Invisible tracker */}
      <div style={{ display: 'none' }} aria-hidden="true"></div>
    </Profiler>
  );
}

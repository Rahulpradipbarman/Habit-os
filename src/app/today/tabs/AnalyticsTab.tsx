import React, { useDeferredValue, useMemo } from 'react';
import { addDays, formatLocalDate } from '@/app/today/dateUtils';

interface AnalyticsTabProps {
  optimisticWeeklyTrends: any[];
  initialCategoryBreakdown: any[];
  initialLogs90Days: any[];
  todayStr: string;
  dailyGoalCompleted: number;
  userTimezone: string;
  moodHistory: any[];
  getMoodColorClass: (mood: string) => string;
  isActive: boolean;
}

export const AnalyticsTab = React.memo(function AnalyticsTab({
  optimisticWeeklyTrends,
  initialCategoryBreakdown,
  initialLogs90Days,
  todayStr,
  dailyGoalCompleted,
  userTimezone,
  moodHistory,
  getMoodColorClass,
  isActive
}: AnalyticsTabProps) {
  // Defer heavy data computations so tab switching is visually instantaneous
  const deferredLogs = useDeferredValue(initialLogs90Days);

  const heatmapData = useMemo(() => {
    // Only compute if we are active or have been visited
    // Deferred value prevents blocking the main thread during navigation
    const data = [];
    const d = new Date(todayStr + 'T12:00:00Z');
    const startOffset = d.getUTCDay(); // days since Sunday
    const totalDays = 13 * 7; // 91 days (13 weeks)
    
    const startDateStr = addDays(todayStr, -startOffset - 84);

    for (let i = 0; i < totalDays; i++) {
      const dateStr = addDays(startDateStr, i);
      const isFuture = dateStr > todayStr;
      
      const dayLogs = deferredLogs.filter(
        log => log.date === dateStr && log.completed
      );
      const completedCount = dateStr === todayStr ? dailyGoalCompleted : dayLogs.length;
      
      let level = 0;
      if (isFuture) {
        level = -1;
      } else if (completedCount === 0) {
        level = 0;
      } else if (completedCount === 1) {
        level = 1;
      } else if (completedCount === 2) {
        level = 2;
      } else {
        level = 3;
      }
      
      data.push({
        date: dateStr,
        count: completedCount,
        level,
      });
    }
    return data;
  }, [deferredLogs, todayStr, dailyGoalCompleted]);

  return (
    <div className={`p-6 lg:p-16 flex-1 ${isActive ? 'block' : 'hidden'}`}>
      <header className="mb-6">
        <h2 className="font-headline text-3xl font-extrabold text-on-surface">Analytics & Insights</h2>
        <p className="text-sm text-on-surface-variant font-medium mt-1">Review your habit patterns over time</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Trends */}
        <div className="p-6 bg-white border border-surface-container rounded-xl shadow-sm">
          <h4 className="font-headline font-bold text-on-surface mb-4">Completion Trends</h4>
          <div className="h-64 flex items-end justify-between px-4 pb-2 border-b border-outline-variant/30 gap-3">
            {optimisticWeeklyTrends.length > 0 ? (
              optimisticWeeklyTrends.map((week, i) => (
                <div key={i} className="flex-1 h-full flex flex-col justify-end group">
                  <div className="w-full bg-surface-container-low/50 rounded-t-xl h-full relative overflow-hidden flex flex-col justify-end border border-outline-variant/10">
                    <div
                      className={`w-full rounded-t-xl transition-all duration-1000 ease-out relative ${
                        week.percentage === 0 ? 'bg-transparent' :
                        i === optimisticWeeklyTrends.length - 1 ? 'bg-secondary shadow-md' : 'bg-primary/80 group-hover:bg-primary'
                      }`}
                      style={{ height: `${Math.max(week.percentage, 0)}%` }}
                      title={`${week.label}: ${week.percentage}%`}
                    >
                      {week.percentage > 0 && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface text-on-surface text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm z-10 pointer-events-none">
                          {week.percentage}%
                        </div>
                      )}
                    </div>
                    {week.percentage === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-[10px] text-on-surface-variant/40 font-bold -rotate-90 whitespace-nowrap tracking-widest">
                          NO DATA
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-on-surface-variant py-8">
                <span className="material-symbols-outlined text-3xl opacity-40 mb-2 font-light">monitoring</span>
                <p className="text-xs max-w-[180px]">No analytics yet — complete habits consistently to unlock insights.</p>
              </div>
            )}
          </div>
          <div className="flex justify-between text-[10px] sm:text-xs text-on-surface-variant mt-3 px-1">
            {optimisticWeeklyTrends.map((week, i) => (
              <span key={i} className={`truncate max-w-[60px] text-center ${i === optimisticWeeklyTrends.length - 1 ? 'font-bold text-secondary' : ''}`} title={week.label}>{week.label}</span>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="p-6 bg-white border border-surface-container rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-headline font-bold text-on-surface mb-2">Streak Master Rank</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Completion rates by time-of-day category over the past 7 days.
            </p>
          </div>
          
          <div className="space-y-3 mt-6">
            {initialCategoryBreakdown.length > 0 ? (
              initialCategoryBreakdown.map((cat, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>{cat.category} Habits</span>
                    <span>{cat.percentage}%</span>
                  </div>
                  <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-500"
                      style={{ width: `${cat.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-on-surface-variant">
                <span className="material-symbols-outlined text-3xl opacity-40 mb-2 font-light">pie_chart</span>
                <p className="text-xs max-w-[200px] mx-auto">No analytics yet — complete habits consistently to unlock insights.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 90-Day Consistency Heatmap */}
      <div className="mt-6 p-6 bg-white border border-surface-container rounded-xl shadow-sm overflow-hidden">
        <h4 className="font-headline font-bold text-on-surface mb-2">90-Day Consistency Heatmap</h4>
        <p className="text-xs text-on-surface-variant mb-6">Visualizing your daily habit completions over the last 13 weeks.</p>
        
        <div className="flex flex-col overflow-x-auto pb-6 pt-2 scrollbar-thin">
          <div className="flex flex-col min-w-max">
            
            {/* Month labels */}
            <div className="flex gap-1.5 mb-3 ml-11 h-4">
              {Array.from({ length: 13 }).map((_, col) => {
                const dayIndex = col * 7;
                let showMonth = false;
                let monthStr = '';
                if (dayIndex < heatmapData.length) {
                  const d = new Date(heatmapData[dayIndex].date + 'T12:00:00Z');
                  monthStr = new Intl.DateTimeFormat("en-US", { month: "short" }).format(d);
                  
                  if (col === 0) {
                    showMonth = true;
                  } else {
                    const prevD = new Date(heatmapData[(col - 1) * 7].date + 'T12:00:00Z');
                    const prevMonthStr = new Intl.DateTimeFormat("en-US", { month: "short" }).format(prevD);
                    if (monthStr !== prevMonthStr) {
                      showMonth = true;
                    }
                  }
                }

                return (
                  <div key={col} className="w-4 sm:w-5 relative h-4">
                    {showMonth && (
                      <span className="text-[10px] font-bold text-on-surface-variant/80 absolute top-0 left-0 whitespace-nowrap">
                        {monthStr}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 min-w-max items-start">
              {/* Day labels (Sun, Tue, Thu, Sat) */}
              <div className="grid grid-rows-7 gap-1.5 text-[10px] text-on-surface-variant/70 font-semibold w-8 text-right pr-2 select-none items-center h-full pt-1">
                <span>Sun</span>
                <span></span>
                <span>Tue</span>
                <span></span>
                <span>Thu</span>
                <span></span>
                <span>Sat</span>
              </div>
              
              {/* Heatmap Grid */}
              <div className="grid grid-flow-col grid-rows-7 gap-1.5">
                {heatmapData.map((day, idx) => {
                  const isFuture = day.level === -1;
                  const levelColors = [
                    'bg-surface-container-low border border-outline-variant/10', // Level 0
                    'bg-primary opacity-[0.35]',                                 // Level 1
                    'bg-primary opacity-[0.65]',                                 // Level 2
                    'bg-primary opacity-100',                                    // Level 3
                  ];
                  
                  return (
                    <div
                      key={idx}
                      className={`group relative w-4 h-4 sm:w-5 sm:h-5 rounded-[4px] transition-all duration-300 ${
                        isFuture ? 'bg-transparent' : levelColors[day.level]
                      } ${!isFuture ? 'hover:scale-125 hover:z-50 hover:shadow-md cursor-pointer' : ''}`}
                    >
                      {!isFuture && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-on-surface text-surface text-[10px] rounded-md shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 flex items-center gap-1.5">
                          <span className="font-bold text-xs">{day.count === 0 ? 'No activity' : `${day.count} habit${day.count === 1 ? '' : 's'}`}</span>
                          <span className="opacity-70 text-[9px] uppercase tracking-wider">on {formatLocalDate(day.date, userTimezone)}</span>
                          
                          {/* Triangle pointer */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-on-surface"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant/70 mt-6 justify-end">
            <span>LESS</span>
            <div className="w-4 h-4 rounded-[4px] bg-surface-container-low border border-outline-variant/10" />
            <div className="w-4 h-4 rounded-[4px] bg-primary opacity-[0.35]" />
            <div className="w-4 h-4 rounded-[4px] bg-primary opacity-[0.65]" />
            <div className="w-4 h-4 rounded-[4px] bg-primary opacity-100" />
            <span>MORE</span>
          </div>
        </div>
      </div>

      {/* Mood History Section */}
      <div className="mt-6 p-6 bg-white border border-surface-container rounded-xl shadow-sm">
        <h4 className="font-headline font-bold text-on-surface mb-2">Mood History</h4>
        <p className="text-xs text-on-surface-variant mb-4">Your recorded moods over the past days.</p>
        
        {moodHistory.length > 0 ? (
          <div className="grid grid-cols-7 sm:grid-cols-10 gap-3">
            {moodHistory.map((entry, i) => (
              <div key={i} className={`flex flex-col items-center gap-1 p-2 rounded-lg border shadow-sm transition-all hover:scale-110 ${getMoodColorClass(entry.emoji)}`}>
                <span className="text-xl drop-shadow-sm">{entry.emoji}</span>
                <span className="text-[9px] font-medium opacity-80">
                  {formatLocalDate(entry.date, userTimezone)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-on-surface-variant border border-dashed border-outline-variant/60 rounded-xl bg-surface-container-low/40">
            <span className="material-symbols-outlined text-4xl opacity-40 mb-3 font-light">mood</span>
            <p className="text-xs max-w-[200px] mx-auto">No mood entries yet — start tracking your daily mood on the dashboard.</p>
          </div>
        )}
      </div>
    </div>
  );
});

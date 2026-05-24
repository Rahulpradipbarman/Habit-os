import React from 'react';

interface CommunityTabProps {
  liveLeaderboard: any[];
  userId: string;
  isActive: boolean;
}

export const CommunityTab = React.memo(function CommunityTab({ liveLeaderboard, userId, isActive }: CommunityTabProps) {
  return (
    <div className={`p-6 lg:p-16 flex-1 ${isActive ? 'block' : 'hidden'}`}>
      <header className="mb-6">
        <h2 className="font-headline text-3xl font-extrabold text-on-surface">Community Leaderboard</h2>
        <p className="text-sm text-on-surface-variant font-medium mt-1">See how you measure up with others</p>
      </header>

      <div className="bg-white border border-surface-container rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant/30 flex justify-between text-xs font-extrabold text-on-surface-variant uppercase">
          <span>User</span>
          <span>Daily Streak</span>
        </div>
        <div className="divide-y divide-outline-variant/20">
          {liveLeaderboard.length > 0 ? (
            liveLeaderboard.map((entry, i) => {
              const isCurrentUser = entry.userId === userId;
              return (
                <div key={entry.userId} className={`px-6 py-4 flex justify-between items-center transition-colors duration-500 ${isCurrentUser ? 'bg-secondary-container/10 border-l-4 border-secondary' : 'border-l-4 border-transparent'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-transform duration-500 ${isCurrentUser ? 'scale-110' : ''} ${
                      i === 0 ? 'bg-gradient-to-br from-yellow-200 to-amber-400 text-amber-900 border border-amber-300' :
                      i === 1 ? 'bg-gradient-to-br from-gray-200 to-gray-400 text-gray-900 border border-gray-300' :
                      i === 2 ? 'bg-gradient-to-br from-orange-200 to-orange-400 text-orange-900 border border-orange-300' :
                      'bg-primary/10 text-primary'
                    }`}>
                      {i + 1}
                    </div>
                    <span className={`text-sm ${isCurrentUser ? 'font-extrabold text-primary' : 'font-bold text-on-surface'}`}>
                      {isCurrentUser ? `${entry.name} (You)` : entry.name}
                    </span>
                  </div>
                  <span className={`text-sm font-bold transition-all duration-500 ${isCurrentUser ? 'font-extrabold text-primary scale-110' : 'text-primary'}`}>
                    {entry.streak} Days
                  </span>
                </div>
              );
            })
          ) : (
            <div className="px-6 py-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-3xl opacity-40 mb-2">group</span>
              <p className="text-xs">No leaderboard data yet. Start building streaks!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

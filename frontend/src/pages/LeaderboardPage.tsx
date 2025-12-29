import React, { useEffect, useState } from 'react';
import { Card } from '@components/common/Card';
import { Loader } from '@components/common/Loader';
import { useWebSocket } from '@hooks/useWebSocket';
import { ParticipantWithRank } from '@types/index';
import { formatRank } from '@utils/formatters';
import clsx from 'clsx';

export const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<ParticipantWithRank[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { isConnected } = useWebSocket('/ws/leaderboard', {
    onMessage: (data) => {
      if (data.type === 'leaderboard_initial' || data.type === 'leaderboard_update') {
        setLeaderboard(data.data);
        setIsLoading(false);
      }
    },
  });

  if (isLoading) return <Loader message="Loading leaderboard..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-display font-bold uppercase tracking-wide text-gradient-psg">Classement Live</h1>
        <div className="flex items-center gap-2">
          <div className={clsx('w-3 h-3 rounded-full', isConnected ? 'bg-fifa-green' : 'bg-gray-500')} />
          <span className="text-sm text-text-secondary font-semibold uppercase tracking-wide">
            {isConnected ? 'Live' : 'Déconnecté'}
          </span>
        </div>
      </div>

      {/* Leaderboard container with border */}
      <div className="bg-bg-card rounded-xl overflow-hidden shadow-lg border border-white/5">
        {/* Header */}
        <div
          className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-text-secondary"
          style={{ background: 'rgba(26, 41, 66, 0.6)' }}
        >
          <div className="grid grid-cols-[60px_1fr_80px] gap-4">
            <div>Rang</div>
            <div>Joueur</div>
            <div className="text-right">Points</div>
          </div>
        </div>

        {/* Leaderboard rows */}
        <div>
          {leaderboard.map((participant) => (
            <div
              key={participant.id}
              className={clsx(
                'grid grid-cols-[60px_1fr_80px] gap-4 px-6 py-4 transition-all duration-200',
                'border-b border-white/5 last:border-b-0',
                'hover:bg-psg-red/5',
                participant.rank === 1 && 'bg-fifa-gold/5',
                participant.rank === 2 && 'bg-fifa-silver/5',
                participant.rank === 3 && 'bg-fifa-bronze/5'
              )}
            >
              {/* Rank */}
              <div className={clsx(
                'text-3xl font-numbers font-black text-center',
                participant.rank <= 3 ? 'text-psg-red' : 'text-text-secondary'
              )}>
                {formatRank(participant.rank)}
              </div>

              {/* Player Info */}
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold">{participant.name}</h3>
                    {participant.is_groom && (
                      <span className="badge badge-groom">Groom</span>
                    )}
                  </div>
                  {participant.points_today !== undefined && (
                    <p className="text-sm text-text-secondary">
                      +{participant.points_today} aujourd'hui
                    </p>
                  )}
                </div>
              </div>

              {/* Points */}
              <div className="text-right">
                <p className="text-3xl font-numbers font-bold text-fifa-gold">
                  {participant.total_points}
                </p>
                <p className="text-sm text-text-secondary">points</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

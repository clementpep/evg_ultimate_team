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
        <h1 className="text-4xl font-heading text-gradient-psg">Live Leaderboard</h1>
        <div className="flex items-center gap-2">
          <div className={clsx('w-3 h-3 rounded-full', isConnected ? 'bg-fifa-green' : 'bg-gray-500')} />
          <span className="text-sm text-gray-400">
            {isConnected ? 'Live' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="grid gap-4">
        {leaderboard.map((participant) => (
          <Card
            key={participant.id}
            className={clsx(
              'transition-all duration-300',
              participant.rank === 1 && 'border-fifa-gold shadow-glow-gold',
              participant.rank === 2 && 'border-fifa-silver shadow-glow-silver',
              participant.rank === 3 && 'border-fifa-bronze shadow-glow-bronze'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={clsx(
                  'text-3xl font-heading w-16 text-center',
                  participant.rank <= 3 && 'text-gradient-gold'
                )}>
                  {formatRank(participant.rank)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold">{participant.name}</h3>
                    {participant.is_groom && (
                      <span className="badge badge-groom">Groom</span>
                    )}
                  </div>
                  {participant.points_today !== undefined && (
                    <p className="text-sm text-gray-400">
                      +{participant.points_today} today
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-mono font-bold text-fifa-gold">
                  {participant.total_points}
                </p>
                <p className="text-sm text-gray-400">points</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

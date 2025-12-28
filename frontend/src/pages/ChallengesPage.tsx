import React from 'react';
import { Card } from '@components/common/Card';
import { Loader } from '@components/common/Loader';
import { useChallenges } from '@hooks/useChallenges';
import { ChallengeStatus, ChallengeType } from '@types/index';
import clsx from 'clsx';

export const ChallengesPage: React.FC = () => {
  const { challenges, isLoading } = useChallenges();

  if (isLoading) return <Loader message="Loading challenges..." />;

  const getChallengeIcon = (type: ChallengeType) => {
    switch (type) {
      case ChallengeType.INDIVIDUAL: return '👤';
      case ChallengeType.TEAM: return '👥';
      case ChallengeType.SECRET: return '🤫';
      default: return '🎯';
    }
  };

  const groupedChallenges = {
    pending: challenges.filter(c => c.status === ChallengeStatus.PENDING),
    active: challenges.filter(c => c.status === ChallengeStatus.ACTIVE),
    completed: challenges.filter(c => c.status === ChallengeStatus.COMPLETED),
  };

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-heading text-gradient-psg">Challenges</h1>

      {/* Pending Challenges */}
      <div>
        <h2 className="text-2xl font-heading mb-4">📋 Available ({groupedChallenges.pending.length})</h2>
        <div className="grid gap-4">
          {groupedChallenges.pending.map((challenge) => (
            <Card key={challenge.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getChallengeIcon(challenge.type)}</span>
                    <h3 className="text-xl font-semibold">{challenge.title}</h3>
                    <span className="badge status-pending capitalize">{challenge.type}</span>
                  </div>
                  <p className="text-gray-400 mb-3">{challenge.description}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-3xl font-mono font-bold text-fifa-gold">{challenge.points}</p>
                  <p className="text-sm text-gray-400">pts</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Active Challenges */}
      {groupedChallenges.active.length > 0 && (
        <div>
          <h2 className="text-2xl font-heading mb-4">⚡ In Progress ({groupedChallenges.active.length})</h2>
          <div className="grid gap-4">
            {groupedChallenges.active.map((challenge) => (
              <Card key={challenge.id} className="border-blue-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getChallengeIcon(challenge.type)}</span>
                      <h3 className="text-xl font-semibold">{challenge.title}</h3>
                      <span className="badge status-active">Active</span>
                    </div>
                    <p className="text-gray-400">{challenge.description}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-3xl font-mono font-bold text-fifa-gold">{challenge.points}</p>
                    <p className="text-sm text-gray-400">pts</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Completed Challenges */}
      {groupedChallenges.completed.length > 0 && (
        <div>
          <h2 className="text-2xl font-heading mb-4">✅ Completed ({groupedChallenges.completed.length})</h2>
          <div className="grid gap-4">
            {groupedChallenges.completed.map((challenge) => (
              <Card key={challenge.id} className="opacity-75">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getChallengeIcon(challenge.type)}</span>
                      <h3 className="text-xl font-semibold">{challenge.title}</h3>
                      <span className="badge status-completed">Completed</span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-2xl font-mono text-fifa-green">{challenge.points}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

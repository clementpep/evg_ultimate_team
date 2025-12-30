import React from 'react';
import { Card } from '@components/common/Card';
import { Loader } from '@components/common/Loader';
import { useChallenges } from '@hooks/useChallenges';
import { ChallengeStatus, ChallengeType } from '@/types/index';
import { FaUser, FaUsers } from 'react-icons/fa';
import { RiSpyFill } from 'react-icons/ri';
import { FaBolt, FaClipboardList, FaTrophy } from 'react-icons/fa6';
import { BiTargetLock } from 'react-icons/bi';

export const ChallengesPage: React.FC = () => {
  const { challenges, isLoading } = useChallenges();

  if (isLoading) return <Loader message="Loading challenges..." />;

  const getChallengeIcon = (type: ChallengeType) => {
    switch (type) {
      case ChallengeType.INDIVIDUAL: return <FaUser className="text-psg-blue" />;
      case ChallengeType.TEAM: return <FaUsers className="text-fifa-green" />;
      case ChallengeType.SECRET: return <RiSpyFill className="text-psg-red" />;
      default: return <BiTargetLock className="text-fifa-gold" />;
    }
  };

  const groupedChallenges = {
    pending: challenges.filter(c => c.status === ChallengeStatus.PENDING),
    active: challenges.filter(c => c.status === ChallengeStatus.ACTIVE),
    completed: challenges.filter(c => c.status === ChallengeStatus.COMPLETED),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BiTargetLock className="text-5xl text-psg-red" />
        <h1 className="text-4xl font-heading text-gradient-psg">
          Défis
        </h1>
      </div>

      {/* Pending Challenges */}
      <div>
        <h2 className="text-2xl font-heading mb-4 flex items-center gap-2">
          <FaClipboardList className="text-psg-blue" /> Disponibles ({groupedChallenges.pending.length})
        </h2>
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
          <h2 className="text-2xl font-heading mb-4 flex items-center gap-2">
            <FaBolt className="text-fifa-green" /> En Cours ({groupedChallenges.active.length})
          </h2>
          <div className="grid gap-4">
            {groupedChallenges.active.map((challenge) => (
              <Card key={challenge.id} className="border-blue-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getChallengeIcon(challenge.type)}</span>
                      <h3 className="text-xl font-semibold">{challenge.title}</h3>
                      <span className="badge status-active">Actif</span>
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
          <h2 className="text-2xl font-heading mb-4 flex items-center gap-2">
            <FaTrophy className="text-fifa-gold" /> Complétés ({groupedChallenges.completed.length})
          </h2>
          <div className="grid gap-4">
            {groupedChallenges.completed.map((challenge) => (
              <Card key={challenge.id} className="opacity-75">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getChallengeIcon(challenge.type)}</span>
                      <h3 className="text-xl font-semibold">{challenge.title}</h3>
                      <span className="badge status-completed">Complété</span>
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

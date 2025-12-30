import React, { useState, useEffect } from 'react';
import { Card } from '@components/common/Card';
import { Button } from '@components/common/Button';
import { Input } from '@components/common/Input';
import { useAuth } from '@context/AuthContext';
import { useToast } from '@context/ToastContext';
import { useChallenges } from '@hooks/useChallenges';
import { validateChallenge } from '@services/challengeService';
import { addPoints } from '@services/pointsService';
import { getAllParticipants } from '@services/participantService';
import { ChallengeStatus } from '@types/index';
import { GiCrown, GiCoins } from 'react-icons/gi';
import { IoMdAdd } from 'react-icons/io';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { challenges, refetch: refetchChallenges } = useChallenges();
  const [participants, setParticipants] = useState<any[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState('');
  const [pointsAmount, setPointsAmount] = useState('');
  const [pointsReason, setPointsReason] = useState('');

  useEffect(() => {
    getAllParticipants().then(setParticipants);
  }, []);

  if (!user?.is_admin) {
    return (
      <div className="text-center py-12">
        <p className="text-2xl text-psg-red">Access Denied - Admin Only</p>
      </div>
    );
  }

  const handleValidateChallenge = async (challengeId: number, participantId: number) => {
    try {
      await validateChallenge(challengeId, {
        participant_ids: [participantId],
        status: ChallengeStatus.COMPLETED,
        admin_id: user.id,
      });
      showToast('Challenge validé avec succès !', 'success');
      refetchChallenges();
      getAllParticipants().then(setParticipants);
    } catch (err) {
      showToast('Erreur lors de la validation', 'error');
    }
  };

  const handlePointsSubmit = async () => {
    try {
      const data = {
        participant_id: parseInt(selectedParticipant),
        amount: parseInt(pointsAmount),
        reason: pointsReason,
        admin_id: user.id,
      };

      await addPoints(data);
      const participantName = participants.find(p => p.id === parseInt(selectedParticipant))?.name;
      showToast(`${pointsAmount} points + crédits ajoutés à ${participantName} !`, 'success');
      setSelectedParticipant('');
      setPointsAmount('');
      setPointsReason('');
      getAllParticipants().then(setParticipants);
    } catch (err) {
      showToast('Erreur lors de l\'ajout de points', 'error');
    }
  };

  const activeChallenges = challenges.filter(c => c.status === ChallengeStatus.ACTIVE);
  const pendingChallenges = challenges.filter(c => c.status === ChallengeStatus.PENDING);
  const completedChallenges = challenges.filter(c => c.status === ChallengeStatus.COMPLETED);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-display text-5xl font-black uppercase tracking-wider mb-2 text-gradient-psg">
          ADMIN DASHBOARD
        </h1>
        <p className="text-text-secondary">Pilotage du jeu EVG Ultimate Team</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl p-6 border text-center" style={{
          background: 'rgba(26, 41, 66, 0.6)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
        }}>
          <div className="font-numbers text-4xl font-black text-fifa-green mb-2">
            {participants.length}
          </div>
          <div className="text-text-secondary text-sm uppercase tracking-wide">Participants</div>
        </div>
        <div className="rounded-xl p-6 border text-center" style={{
          background: 'rgba(26, 41, 66, 0.6)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
        }}>
          <div className="font-numbers text-4xl font-black text-fifa-gold mb-2">
            {activeChallenges.length}
          </div>
          <div className="text-text-secondary text-sm uppercase tracking-wide">Challenges Actifs</div>
        </div>
        <div className="rounded-xl p-6 border text-center" style={{
          background: 'rgba(26, 41, 66, 0.6)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
        }}>
          <div className="font-numbers text-4xl font-black text-psg-blue mb-2">
            {pendingChallenges.length}
          </div>
          <div className="text-text-secondary text-sm uppercase tracking-wide">En Attente</div>
        </div>
        <div className="rounded-xl p-6 border text-center" style={{
          background: 'rgba(26, 41, 66, 0.6)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
        }}>
          <div className="font-numbers text-4xl font-black text-psg-red mb-2">
            {completedChallenges.length}
          </div>
          <div className="text-text-secondary text-sm uppercase tracking-wide">Complétés</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Points & Credits Management */}
        <Card>
          <h2 className="font-display text-2xl font-bold mb-4 uppercase tracking-wide">Gérer Points & Crédits</h2>
          <p className="text-text-tertiary text-sm mb-4 flex items-center gap-2">
            <GiCoins className="text-fifa-gold text-lg" /> Ajouter des points = Ajouter des points ET des crédits (ratio 1:1)
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-text-secondary text-sm mb-2 font-semibold">Participant</label>
              <select
                value={selectedParticipant}
                onChange={(e) => setSelectedParticipant(e.target.value)}
                className="input-field"
              >
                <option value="">Sélectionner un participant</option>
                {participants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {p.total_points} pts / {p.pack_credits} crédits
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-text-secondary text-sm mb-2 font-semibold">Montant</label>
              <Input
                type="number"
                value={pointsAmount}
                onChange={(e) => setPointsAmount(e.target.value)}
                placeholder="Nombre de points à ajouter"
              />
            </div>
            <div>
              <label className="block text-text-secondary text-sm mb-2 font-semibold">Raison</label>
              <Input
                value={pointsReason}
                onChange={(e) => setPointsReason(e.target.value)}
                placeholder="Challenge, bonus, correction..."
              />
            </div>
            <Button
              variant="success"
              className="w-full flex items-center justify-center gap-2"
              onClick={handlePointsSubmit}
              disabled={!selectedParticipant || !pointsAmount || !pointsReason}
            >
              <IoMdAdd className="text-xl" /> Ajouter {pointsAmount || '0'} Points + {pointsAmount || '0'} Crédits
            </Button>
          </div>
        </Card>

        {/* Participants List */}
        <Card>
          <h2 className="font-display text-2xl font-bold mb-4 uppercase tracking-wide">Participants</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {participants
              .sort((a, b) => b.total_points - a.total_points)
              .map((p, index) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-white/5 hover:border-white/10 transition-colors" style={{
                background: 'rgba(0, 0, 0, 0.2)',
              }}>
                <div className="flex items-center gap-3">
                  <div className="font-numbers text-lg font-bold text-text-tertiary w-8">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{p.name}</div>
                    <div className="text-xs text-text-tertiary">
                      {p.total_points} pts • {p.pack_credits} crédits
                    </div>
                  </div>
                </div>
                {p.is_groom && (
                  <span className="text-fifa-gold text-xs font-bold flex items-center gap-1">
                    <GiCrown /> GROOM
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* All Challenges Management */}
      <Card>
        <h2 className="font-display text-2xl font-bold mb-4 uppercase tracking-wide">Tous les Défis</h2>
        <div className="space-y-3">
          {challenges.length === 0 ? (
            <p className="text-text-tertiary text-center py-8">Aucun défi disponible</p>
          ) : (
            challenges.map((challenge) => (
              <div key={challenge.id} className="border border-white/10 rounded-lg p-4 flex items-center justify-between" style={{
                background: 'rgba(0, 0, 0, 0.2)',
              }}>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white">{challenge.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded font-semibold uppercase ${
                      challenge.status === ChallengeStatus.ACTIVE
                        ? 'bg-fifa-green/20 text-fifa-green'
                        : challenge.status === ChallengeStatus.COMPLETED
                        ? 'bg-psg-red/20 text-psg-red'
                        : 'bg-fifa-gold/20 text-fifa-gold'
                    }`}>
                      {challenge.status === ChallengeStatus.ACTIVE ? 'Actif' : challenge.status === ChallengeStatus.COMPLETED ? 'Complété' : 'En attente'}
                    </span>
                  </div>
                  <p className="text-text-secondary text-sm mb-2">{challenge.description}</p>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-numbers text-fifa-gold font-bold">{challenge.points} pts</span>
                    <span className="text-text-tertiary">•</span>
                    <span className="text-text-tertiary capitalize">{challenge.type}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Active Challenges to Validate */}
      <Card>
        <h2 className="font-display text-2xl font-bold mb-4 uppercase tracking-wide">Valider les Challenges Actifs</h2>
        {activeChallenges.length === 0 ? (
          <p className="text-text-tertiary text-center py-8">Aucun challenge actif à valider</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeChallenges.map((challenge) => (
              <div key={challenge.id} className="border border-white/10 rounded-lg p-4 space-y-3" style={{
                background: 'rgba(0, 0, 0, 0.2)',
              }}>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{challenge.title}</h3>
                  <p className="text-text-secondary text-sm mb-2">{challenge.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="font-numbers text-fifa-gold font-bold">{challenge.points} pts</span>
                    <span className="text-xs text-text-tertiary">•</span>
                    <span className="text-xs text-text-tertiary uppercase">{challenge.type}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-text-tertiary font-semibold uppercase tracking-wide">Valider pour:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {participants.slice(0, 6).map((p) => (
                      <Button
                        key={p.id}
                        variant="success"
                        className="text-xs !py-2"
                        onClick={() => handleValidateChallenge(challenge.id, p.id)}
                      >
                        {p.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

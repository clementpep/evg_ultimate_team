import React, { useState, useEffect } from 'react';
import { Card } from '@components/common/Card';
import { Button } from '@components/common/Button';
import { Input } from '@components/common/Input';
import { useAuth } from '@context/AuthContext';
import { useChallenges } from '@hooks/useChallenges';
import { validateChallenge } from '@services/challengeService';
import { addPoints } from '@services/pointsService';
import { getAllParticipants } from '@services/participantService';
import { ChallengeStatus } from '@types/index';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { challenges, refetch: refetchChallenges } = useChallenges();
  const [participants, setParticipants] = useState<any[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState('');
  const [pointsAmount, setPointsAmount] = useState('');
  const [pointsReason, setPointsReason] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

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

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleValidateChallenge = async (challengeId: number, participantId: number) => {
    try {
      await validateChallenge(challengeId, {
        participant_ids: [participantId],
        status: ChallengeStatus.COMPLETED,
        admin_id: user.id,
      });
      showMessage('Challenge validé avec succès !');
      refetchChallenges();
      getAllParticipants().then(setParticipants);
    } catch (err) {
      showMessage('Erreur lors de la validation', 'error');
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
      showMessage(`${pointsAmount} points + crédits ajoutés à ${participants.find(p => p.id === parseInt(selectedParticipant))?.name} !`);
      setSelectedParticipant('');
      setPointsAmount('');
      setPointsReason('');
      getAllParticipants().then(setParticipants);
    } catch (err) {
      showMessage('Erreur lors de l\'ajout de points', 'error');
    }
  };

  const activeChallenges = challenges.filter(c => c.status === ChallengeStatus.ACTIVE);
  const pendingChallenges = challenges.filter(c => c.status === ChallengeStatus.PENDING);
  const completedChallenges = challenges.filter(c => c.status === ChallengeStatus.COMPLETED);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-display text-5xl font-black uppercase tracking-wider mb-2" style={{
          color: '#FFFFFF',
          textShadow: '0 0 20px rgba(218, 41, 28, 0.5), 0 0 40px rgba(0, 31, 91, 0.3)',
        }}>
          ADMIN DASHBOARD
        </h1>
        <p className="text-text-secondary">Pilotage du jeu EVG Ultimate Team</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`border rounded-lg p-4 text-center font-semibold ${
          messageType === 'success'
            ? 'bg-fifa-green/20 border-fifa-green text-fifa-green'
            : 'bg-psg-red/20 border-psg-red text-psg-red'
        }`}>
          {message}
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl p-6 border text-center" style={{
          background: 'rgba(26, 41, 66, 0.8)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
        }}>
          <div className="font-numbers text-4xl font-black text-fifa-green mb-2">
            {participants.length}
          </div>
          <div className="text-text-secondary text-sm uppercase tracking-wide">Participants</div>
        </div>
        <div className="rounded-xl p-6 border text-center" style={{
          background: 'rgba(26, 41, 66, 0.8)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
        }}>
          <div className="font-numbers text-4xl font-black text-fifa-gold mb-2">
            {activeChallenges.length}
          </div>
          <div className="text-text-secondary text-sm uppercase tracking-wide">Challenges Actifs</div>
        </div>
        <div className="rounded-xl p-6 border text-center" style={{
          background: 'rgba(26, 41, 66, 0.8)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
        }}>
          <div className="font-numbers text-4xl font-black text-psg-blue mb-2">
            {pendingChallenges.length}
          </div>
          <div className="text-text-secondary text-sm uppercase tracking-wide">En Attente</div>
        </div>
        <div className="rounded-xl p-6 border text-center" style={{
          background: 'rgba(26, 41, 66, 0.8)',
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
          <p className="text-text-tertiary text-sm mb-4">
            💰 Ajouter des points = Ajouter des points ET des crédits (ratio 1:1)
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
              className="w-full"
              onClick={handlePointsSubmit}
              disabled={!selectedParticipant || !pointsAmount || !pointsReason}
            >
              ➕ Ajouter {pointsAmount || '0'} Points + {pointsAmount || '0'} Crédits
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
                  <span className="text-fifa-gold text-xs font-bold">👑 GROOM</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

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

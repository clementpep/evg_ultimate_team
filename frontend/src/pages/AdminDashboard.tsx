import React, { useState } from 'react';
import { Card } from '@components/common/Card';
import { Button } from '@components/common/Button';
import { Input } from '@components/common/Input';
import { useAuth } from '@context/AuthContext';
import { useChallenges } from '@hooks/useChallenges';
import { validateChallenge } from '@services/challengeService';
import { addPoints, subtractPoints } from '@services/pointsService';
import { getAllParticipants } from '@services/participantService';
import { ChallengeStatus } from '@types/index';
import { useEffect } from 'react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { challenges, refetch: refetchChallenges } = useChallenges();
  const [participants, setParticipants] = useState<any[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState('');
  const [pointsAmount, setPointsAmount] = useState('');
  const [pointsReason, setPointsReason] = useState('');
  const [message, setMessage] = useState('');

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
      setMessage('Challenge validated successfully!');
      refetchChallenges();
    } catch (err) {
      setMessage('Failed to validate challenge');
    }
  };

  const handlePointsSubmit = async (isAdd: boolean) => {
    try {
      const data = {
        participant_id: parseInt(selectedParticipant),
        amount: parseInt(pointsAmount),
        reason: pointsReason,
        admin_id: user.id,
      };

      if (isAdd) {
        await addPoints(data);
      } else {
        await subtractPoints(data);
      }

      setMessage(`Points ${isAdd ? 'added' : 'subtracted'} successfully!`);
      setSelectedParticipant('');
      setPointsAmount('');
      setPointsReason('');
    } catch (err) {
      setMessage('Failed to adjust points');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-heading text-gradient-psg">Admin Dashboard</h1>

      {message && (
        <div className="bg-fifa-green/20 border border-fifa-green rounded-lg p-4">
          {message}
        </div>
      )}

      {/* Points Management */}
      <Card>
        <h2 className="text-2xl font-heading mb-4">Manage Points</h2>
        <div className="grid gap-4">
          <select
            value={selectedParticipant}
            onChange={(e) => setSelectedParticipant(e.target.value)}
            className="input-field"
          >
            <option value="">Select Participant</option>
            {participants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.total_points} pts)
              </option>
            ))}
          </select>
          <Input
            type="number"
            value={pointsAmount}
            onChange={(e) => setPointsAmount(e.target.value)}
            placeholder="Points amount"
          />
          <Input
            value={pointsReason}
            onChange={(e) => setPointsReason(e.target.value)}
            placeholder="Reason"
          />
          <div className="flex gap-4">
            <Button
              variant="success"
              onClick={() => handlePointsSubmit(true)}
              disabled={!selectedParticipant || !pointsAmount}
            >
              Add Points
            </Button>
            <Button
              variant="danger"
              onClick={() => handlePointsSubmit(false)}
              disabled={!selectedParticipant || !pointsAmount}
            >
              Subtract Points
            </Button>
          </div>
        </div>
      </Card>

      {/* Active Challenges to Validate */}
      <Card>
        <h2 className="text-2xl font-heading mb-4">Validate Active Challenges</h2>
        <div className="space-y-4">
          {challenges.filter(c => c.status === ChallengeStatus.ACTIVE).map((challenge) => (
            <div key={challenge.id} className="border border-gray-700 rounded-lg p-4">
              <h3 className="text-xl font-semibold mb-2">{challenge.title}</h3>
              <p className="text-gray-400 mb-2">{challenge.description}</p>
              <p className="text-fifa-gold mb-4">{challenge.points} points</p>
              <div className="grid gap-2">
                {participants.map((p) => (
                  <Button
                    key={p.id}
                    variant="success"
                    className="text-sm py-1"
                    onClick={() => handleValidateChallenge(challenge.id, p.id)}
                  >
                    Validate for {p.name}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

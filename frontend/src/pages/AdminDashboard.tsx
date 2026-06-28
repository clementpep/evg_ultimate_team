import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@components/common/Card';
import { Button } from '@components/common/Button';
import { Input } from '@components/common/Input';
import { useAuth } from '@context/AuthContext';
import { useToast } from '@context/ToastContext';
import { useChallenges } from '@hooks/useChallenges';
import {
  validateChallenge,
  createChallenge,
  updateChallenge,
  deleteChallenge,
} from '@services/challengeService';
import { addPoints, subtractPoints } from '@services/pointsService';
import { getAllParticipants } from '@services/participantService';
import {
  resetDatabase,
  getRewardCatalogue,
  createReward,
  updateReward,
  deleteReward,
} from '@services/adminService';
import { ChallengeStatus, ChallengeType } from '@/types/index';
import { PackRewardAdmin, PackTier, TIER_RARITIES } from '@/types/pack';
import { GiCrown, GiCoins } from 'react-icons/gi';
import { IoMdAdd, IoMdRemove, IoMdWarning, IoMdTrash, IoMdCreate, IoMdClose } from 'react-icons/io';

const PACK_TIERS: PackTier[] = ['bronze', 'silver', 'gold', 'ultimate'];

const RARITY_COLORS: Record<string, string> = {
  common: '#C0C0C0',
  rare: '#00A2FF',
  epic: '#B14EFF',
  legendary: '#D4AF37',
};

const emptyChallengeForm = {
  title: '',
  description: '',
  type: ChallengeType.INDIVIDUAL,
  points: 30,
};

const emptyRewardForm = {
  tier: 'bronze' as PackTier,
  name: '',
  description: '',
  type: 'power',
  rarity: 'common' as PackRewardAdmin['rarity'],
  is_active: true,
};

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { challenges, refetch: refetchChallenges } = useChallenges();
  const [participants, setParticipants] = useState<any[]>([]);

  // Points management
  const [selectedParticipant, setSelectedParticipant] = useState('');
  const [pointsAmount, setPointsAmount] = useState('');
  const [pointsReason, setPointsReason] = useState('');

  // Challenge form (create/edit)
  const [challengeForm, setChallengeForm] = useState(emptyChallengeForm);
  const [editingChallengeId, setEditingChallengeId] = useState<number | null>(null);

  // Reward catalogue
  const [rewards, setRewards] = useState<PackRewardAdmin[]>([]);
  const [rewardForm, setRewardForm] = useState(emptyRewardForm);
  const [editingRewardId, setEditingRewardId] = useState<number | null>(null);

  // Danger zone
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');

  const refreshParticipants = useCallback(() => {
    getAllParticipants().then(setParticipants).catch(() => {});
  }, []);

  const refreshRewards = useCallback(() => {
    getRewardCatalogue().then(setRewards).catch(() => {});
  }, []);

  useEffect(() => {
    refreshParticipants();
    refreshRewards();
  }, [refreshParticipants, refreshRewards]);

  if (!user?.is_admin) {
    return (
      <div className="text-center py-12">
        <p className="text-2xl text-psg-red">Accès refusé — réservé à l'admin</p>
      </div>
    );
  }

  // ===========================================================================
  // Points
  // ===========================================================================
  const submitPoints = async (mode: 'add' | 'subtract') => {
    const amount = parseInt(pointsAmount, 10);
    if (!selectedParticipant || !amount || !pointsReason) return;
    const data = {
      participant_id: parseInt(selectedParticipant, 10),
      amount,
      reason: pointsReason,
      admin_id: user.id,
    };
    const name = participants.find((p) => p.id === data.participant_id)?.name;
    try {
      if (mode === 'add') {
        await addPoints(data);
        showToast(`+${amount} points pour ${name}`, 'success');
      } else {
        await subtractPoints(data);
        showToast(`−${amount} points pour ${name}`, 'success');
      }
      setSelectedParticipant('');
      setPointsAmount('');
      setPointsReason('');
      refreshParticipants();
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Erreur sur les points', 'error');
    }
  };

  // ===========================================================================
  // Challenges
  // ===========================================================================
  const submitChallenge = async () => {
    if (!challengeForm.title || !challengeForm.description) return;
    try {
      if (editingChallengeId) {
        await updateChallenge(editingChallengeId, challengeForm);
        showToast('Défi mis à jour', 'success');
      } else {
        await createChallenge(challengeForm);
        showToast('Défi créé', 'success');
      }
      setChallengeForm(emptyChallengeForm);
      setEditingChallengeId(null);
      refetchChallenges();
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Erreur sur le défi', 'error');
    }
  };

  const editChallenge = (c: any) => {
    setEditingChallengeId(c.id);
    setChallengeForm({
      title: c.title,
      description: c.description,
      type: c.type,
      points: c.points,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removeChallenge = async (id: number) => {
    if (!window.confirm('Supprimer ce défi ?')) return;
    try {
      await deleteChallenge(id);
      showToast('Défi supprimé', 'success');
      if (editingChallengeId === id) {
        setEditingChallengeId(null);
        setChallengeForm(emptyChallengeForm);
      }
      refetchChallenges();
    } catch {
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const handleValidateChallenge = async (challengeId: number, participantId: number) => {
    try {
      await validateChallenge(challengeId, {
        participant_ids: [participantId],
        status: ChallengeStatus.COMPLETED,
        admin_id: user.id,
      });
      showToast('Défi validé', 'success');
      refetchChallenges();
      refreshParticipants();
    } catch {
      showToast('Erreur lors de la validation', 'error');
    }
  };

  // ===========================================================================
  // Rewards
  // ===========================================================================
  const submitReward = async () => {
    if (!rewardForm.name || !rewardForm.description) return;
    try {
      if (editingRewardId) {
        await updateReward(editingRewardId, rewardForm);
        showToast('Récompense mise à jour', 'success');
      } else {
        await createReward(rewardForm);
        showToast('Récompense créée', 'success');
      }
      setRewardForm(emptyRewardForm);
      setEditingRewardId(null);
      refreshRewards();
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Erreur sur la récompense', 'error');
    }
  };

  const editReward = (r: PackRewardAdmin) => {
    setEditingRewardId(r.id);
    setRewardForm({
      tier: r.tier,
      name: r.name,
      description: r.description,
      type: r.type,
      rarity: r.rarity,
      is_active: r.is_active,
    });
  };

  const removeReward = async (id: number) => {
    if (!window.confirm('Supprimer cette récompense ?')) return;
    try {
      await deleteReward(id);
      showToast('Récompense supprimée', 'success');
      if (editingRewardId === id) {
        setEditingRewardId(null);
        setRewardForm(emptyRewardForm);
      }
      refreshRewards();
    } catch {
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const toggleRewardActive = async (r: PackRewardAdmin) => {
    try {
      await updateReward(r.id, { is_active: !r.is_active });
      refreshRewards();
    } catch {
      showToast('Erreur lors du changement de statut', 'error');
    }
  };

  // When the tier changes in the reward form, keep rarity valid for that tier
  const onRewardTierChange = (tier: PackTier) => {
    const allowed = TIER_RARITIES[tier];
    setRewardForm((f) => ({
      ...f,
      tier,
      rarity: allowed.includes(f.rarity) ? f.rarity : allowed[0]!,
    }));
  };

  const handleResetDatabase = async () => {
    if (resetConfirmText !== 'RESET') return;
    try {
      const result = await resetDatabase();
      showToast(result.message, 'success');
      setShowResetConfirm(false);
      setResetConfirmText('');
      refreshParticipants();
      refreshRewards();
      refetchChallenges();
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Erreur lors du reset', 'error');
    }
  };

  const activeChallenges = challenges.filter((c) => c.status === ChallengeStatus.ACTIVE);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-wider mb-1 text-gradient-psg">
          Admin Panel
        </h1>
        <p className="text-text-secondary text-sm">Pilotage du jeu — Clément P.</p>
      </div>

      {/* ===================== POINTS ===================== */}
      <Card>
        <h2 className="font-display text-xl sm:text-2xl font-bold mb-3 uppercase tracking-wide flex items-center gap-2">
          <GiCoins className="text-fifa-gold" /> Points &amp; Crédits
        </h2>
        <div className="space-y-3">
          <select
            value={selectedParticipant}
            onChange={(e) => setSelectedParticipant(e.target.value)}
            className="input-field"
          >
            <option value="">Sélectionner un participant</option>
            {participants
              .slice()
              .sort((a, b) => b.total_points - a.total_points)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.total_points} pts / {p.pack_credits} crédits
                </option>
              ))}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              value={pointsAmount}
              onChange={(e) => setPointsAmount(e.target.value)}
              placeholder="Montant"
            />
            <Input
              value={pointsReason}
              onChange={(e) => setPointsReason(e.target.value)}
              placeholder="Raison"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="success"
              className="flex items-center justify-center gap-2"
              onClick={() => submitPoints('add')}
              disabled={!selectedParticipant || !pointsAmount || !pointsReason}
            >
              <IoMdAdd /> Ajouter
            </Button>
            <Button
              variant="danger"
              className="flex items-center justify-center gap-2"
              onClick={() => submitPoints('subtract')}
              disabled={!selectedParticipant || !pointsAmount || !pointsReason}
            >
              <IoMdRemove /> Retirer
            </Button>
          </div>
          <p className="text-text-tertiary text-xs">
            Ajouter des points ajoute aussi des crédits (1:1). Retirer n'enlève que des points.
          </p>
        </div>
      </Card>

      {/* ===================== VALIDATION ===================== */}
      {activeChallenges.length > 0 && (
        <Card>
          <h2 className="font-display text-xl sm:text-2xl font-bold mb-3 uppercase tracking-wide">
            Valider les défis actifs
          </h2>
          <div className="space-y-4">
            {activeChallenges.map((challenge) => (
              <div
                key={challenge.id}
                className="border border-white/10 rounded-lg p-4"
                style={{ background: 'rgba(0,0,0,0.2)' }}
              >
                <h3 className="text-base font-bold text-white mb-1">{challenge.title}</h3>
                <p className="text-fifa-gold font-numbers text-sm mb-3">{challenge.points} pts</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {participants.map((p) => (
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
            ))}
          </div>
        </Card>
      )}

      {/* ===================== CHALLENGES CRUD ===================== */}
      <Card>
        <h2 className="font-display text-xl sm:text-2xl font-bold mb-3 uppercase tracking-wide">
          {editingChallengeId ? 'Modifier le défi' : 'Nouveau défi'}
        </h2>
        <div className="space-y-3 mb-6">
          <Input
            value={challengeForm.title}
            onChange={(e) => setChallengeForm({ ...challengeForm, title: e.target.value })}
            placeholder="Titre du défi"
          />
          <textarea
            value={challengeForm.description}
            onChange={(e) => setChallengeForm({ ...challengeForm, description: e.target.value })}
            placeholder="Description"
            rows={2}
            className="input-field resize-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={challengeForm.type}
              onChange={(e) =>
                setChallengeForm({ ...challengeForm, type: e.target.value as ChallengeType })
              }
              className="input-field"
            >
              <option value={ChallengeType.INDIVIDUAL}>Individuel</option>
              <option value={ChallengeType.TEAM}>Équipe</option>
              <option value={ChallengeType.SECRET}>Secret</option>
            </select>
            <Input
              type="number"
              value={String(challengeForm.points)}
              onChange={(e) =>
                setChallengeForm({ ...challengeForm, points: parseInt(e.target.value, 10) || 0 })
              }
              placeholder="Points"
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="success"
              className="flex items-center justify-center gap-2"
              onClick={submitChallenge}
              disabled={!challengeForm.title || !challengeForm.description}
            >
              {editingChallengeId ? <IoMdCreate /> : <IoMdAdd />}
              {editingChallengeId ? 'Enregistrer' : 'Créer'}
            </Button>
            {editingChallengeId && (
              <Button
                variant="secondary"
                className="flex items-center justify-center gap-2"
                onClick={() => {
                  setEditingChallengeId(null);
                  setChallengeForm(emptyChallengeForm);
                }}
              >
                <IoMdClose /> Annuler
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {challenges.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-2 p-3 rounded-lg border border-white/5"
              style={{ background: 'rgba(0,0,0,0.2)' }}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{c.title}</p>
                <p className="text-xs text-text-tertiary">
                  {c.points} pts • {c.type} • {c.status}
                </p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => editChallenge(c)}
                  className="p-2 rounded-lg text-fifa-gold hover:bg-fifa-gold/20"
                  aria-label="Modifier"
                >
                  <IoMdCreate />
                </button>
                <button
                  onClick={() => removeChallenge(c.id)}
                  className="p-2 rounded-lg text-psg-red hover:bg-psg-red/20"
                  aria-label="Supprimer"
                >
                  <IoMdTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ===================== REWARDS CRUD ===================== */}
      <Card>
        <h2 className="font-display text-xl sm:text-2xl font-bold mb-3 uppercase tracking-wide">
          {editingRewardId ? 'Modifier la récompense' : 'Nouvelle récompense'}
        </h2>
        <div className="space-y-3 mb-6">
          <div className="grid grid-cols-2 gap-3">
            <select
              value={rewardForm.tier}
              onChange={(e) => onRewardTierChange(e.target.value as PackTier)}
              className="input-field"
            >
              {PACK_TIERS.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={rewardForm.rarity}
              onChange={(e) =>
                setRewardForm({ ...rewardForm, rarity: e.target.value as PackRewardAdmin['rarity'] })
              }
              className="input-field"
            >
              {TIER_RARITIES[rewardForm.tier].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <Input
            value={rewardForm.name}
            onChange={(e) => setRewardForm({ ...rewardForm, name: e.target.value })}
            placeholder="Nom de la récompense"
          />
          <textarea
            value={rewardForm.description}
            onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
            placeholder="Description"
            rows={2}
            className="input-field resize-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={rewardForm.type}
              onChange={(e) => setRewardForm({ ...rewardForm, type: e.target.value })}
              className="input-field"
            >
              <option value="power">Power</option>
              <option value="shot">Shot</option>
              <option value="immunity">Immunity</option>
              <option value="wildcard">Wildcard</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-text-secondary px-1">
              <input
                type="checkbox"
                checked={rewardForm.is_active}
                onChange={(e) => setRewardForm({ ...rewardForm, is_active: e.target.checked })}
                className="w-4 h-4 accent-fifa-gold"
              />
              Active
            </label>
          </div>
          <div className="flex gap-3">
            <Button
              variant="success"
              className="flex items-center justify-center gap-2"
              onClick={submitReward}
              disabled={!rewardForm.name || !rewardForm.description}
            >
              {editingRewardId ? <IoMdCreate /> : <IoMdAdd />}
              {editingRewardId ? 'Enregistrer' : 'Créer'}
            </Button>
            {editingRewardId && (
              <Button
                variant="secondary"
                className="flex items-center justify-center gap-2"
                onClick={() => {
                  setEditingRewardId(null);
                  setRewardForm(emptyRewardForm);
                }}
              >
                <IoMdClose /> Annuler
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {PACK_TIERS.map((tier) => {
            const tierRewards = rewards.filter((r) => r.tier === tier);
            if (tierRewards.length === 0) return null;
            return (
              <div key={tier}>
                <h3 className="text-xs uppercase tracking-wider text-text-tertiary font-bold mb-2">
                  {tier}
                </h3>
                <div className="space-y-2">
                  {tierRewards.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between gap-2 p-3 rounded-lg border border-white/5"
                      style={{ background: 'rgba(0,0,0,0.2)', opacity: r.is_active ? 1 : 0.5 }}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white truncate flex items-center gap-2">
                          <span
                            className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: RARITY_COLORS[r.rarity] || '#888' }}
                          />
                          {r.name}
                        </p>
                        <p className="text-xs text-text-tertiary truncate">{r.description}</p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => toggleRewardActive(r)}
                          className="px-2 py-1 rounded-lg text-xs font-semibold text-text-secondary hover:bg-white/10"
                          aria-label="Activer/désactiver"
                        >
                          {r.is_active ? 'ON' : 'OFF'}
                        </button>
                        <button
                          onClick={() => editReward(r)}
                          className="p-2 rounded-lg text-fifa-gold hover:bg-fifa-gold/20"
                          aria-label="Modifier"
                        >
                          <IoMdCreate />
                        </button>
                        <button
                          onClick={() => removeReward(r.id)}
                          className="p-2 rounded-lg text-psg-red hover:bg-psg-red/20"
                          aria-label="Supprimer"
                        >
                          <IoMdTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ===================== PARTICIPANTS (overview) ===================== */}
      <Card>
        <h2 className="font-display text-xl sm:text-2xl font-bold mb-3 uppercase tracking-wide">
          Classement
        </h2>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {participants
            .slice()
            .sort((a, b) => b.total_points - a.total_points)
            .map((p, index) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-2 rounded-lg border border-white/5"
                style={{ background: 'rgba(0,0,0,0.2)' }}
              >
                <div className="flex items-center gap-3">
                  <span className="font-numbers text-text-tertiary w-6 text-sm">#{index + 1}</span>
                  <span className="font-semibold text-white text-sm">{p.name}</span>
                  {p.is_groom && <GiCrown className="text-fifa-gold" />}
                </div>
                <span className="text-xs text-text-tertiary">
                  {p.total_points} pts • {p.pack_credits} cr
                </span>
              </div>
            ))}
        </div>
      </Card>

      {/* ===================== DANGER ZONE ===================== */}
      <Card>
        <div
          className="border-2 border-psg-red rounded-lg p-5"
          style={{ background: 'rgba(218, 41, 28, 0.1)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <IoMdWarning className="text-psg-red text-2xl" />
            <h2 className="font-display text-xl font-bold uppercase tracking-wide text-psg-red">
              Danger Zone
            </h2>
          </div>
          <p className="text-text-secondary text-sm mb-4">
            Réinitialise toute la base (points, défis, packs, historique). Irréversible.
          </p>
          {!showResetConfirm ? (
            <Button
              variant="danger"
              className="flex items-center gap-2"
              onClick={() => setShowResetConfirm(true)}
            >
              <IoMdTrash /> Réinitialiser la base
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-text-secondary text-sm">
                Tapez <code className="bg-black/50 px-2 py-1 rounded text-psg-red font-mono">RESET</code> pour confirmer :
              </p>
              <Input
                value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value)}
                placeholder="RESET"
              />
              <div className="flex gap-3">
                <Button
                  variant="danger"
                  className="flex items-center gap-2"
                  onClick={handleResetDatabase}
                  disabled={resetConfirmText !== 'RESET'}
                >
                  <IoMdTrash /> Confirmer
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowResetConfirm(false);
                    setResetConfirmText('');
                  }}
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

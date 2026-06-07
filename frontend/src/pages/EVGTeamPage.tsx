/**
 * EVGTeamPage - Shared 5v5 lineup.
 *
 * - View mode (everyone): the pitch with both teams, the bench and the
 *   not-yet-placed players. Tapping a card opens a full-size view.
 * - Edit mode (Paul the groom, or admin): tap-to-place — select a player,
 *   then tap a zone (team / bench / pool) to move them. Save persists the
 *   lineup for everyone to see.
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@context/AuthContext';
import { useToast } from '@context/ToastContext';
import { getTeamComposition, updateTeamComposition } from '@services/teamService';
import { getAvatarUrl, getDefaultAvatarUrl } from '@utils/avatarUtils';
import { ParticipantSummary } from '@/types/participant';
import { TeamComposition, MAX_TEAM_SIZE, MAX_BENCH_SIZE } from '@/types/team';
import { FivePitch, PitchZone } from '@components/team/FivePitch';

interface WorkState {
  A: number[];
  B: number[];
  bench: number[];
  aName: string;
  bName: string;
}

export const EVGTeamPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();

  const canEdit = !!user && (user.is_groom || user.is_admin);

  const [composition, setComposition] = useState<TeamComposition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedCard, setSelectedCard] = useState<ParticipantSummary | null>(null);
  const [work, setWork] = useState<WorkState>({ A: [], B: [], bench: [], aName: '', bName: '' });

  // Lookup of every participant by id (built from all four lists)
  const allById = useMemo(() => {
    const map = new Map<number, ParticipantSummary>();
    if (composition) {
      [...composition.team_a, ...composition.team_b, ...composition.bench, ...composition.unplaced].forEach(
        (p) => map.set(p.id, p)
      );
    }
    return map;
  }, [composition]);

  const allOrdered = useMemo(() => Array.from(allById.values()), [allById]);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getTeamComposition();
      setComposition(data);
    } catch (error) {
      console.error('Failed to fetch team composition:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const enterEdit = useCallback(() => {
    if (!composition) return;
    setWork({
      A: composition.team_a.map((p) => p.id),
      B: composition.team_b.map((p) => p.id),
      bench: composition.bench.map((p) => p.id),
      aName: composition.team_a_name,
      bName: composition.team_b_name,
    });
    setSelectedId(null);
    setEditMode(true);
  }, [composition]);

  // Auto-enter edit mode once when arriving from the discovery CTA (/team?edit)
  const autoEditApplied = useRef(false);
  useEffect(() => {
    if (
      !autoEditApplied.current &&
      !isLoading &&
      canEdit &&
      composition &&
      new URLSearchParams(location.search).has('edit')
    ) {
      autoEditApplied.current = true;
      enterEdit();
    }
  }, [isLoading, canEdit, composition, location.search, enterEdit]);

  const cancelEdit = () => {
    setEditMode(false);
    setSelectedId(null);
  };

  const handlePlayerClick = (p: ParticipantSummary) => {
    if (editMode) {
      setSelectedId((prev) => (prev === p.id ? null : p.id));
    } else {
      setSelectedCard(p);
    }
  };

  const handleZoneClick = (zone: PitchZone) => {
    if (selectedId === null) return;
    const id = selectedId;

    const A = work.A.filter((x) => x !== id);
    const B = work.B.filter((x) => x !== id);
    const bench = work.bench.filter((x) => x !== id);

    if (zone === 'A') {
      if (!work.A.includes(id) && A.length >= MAX_TEAM_SIZE) {
        showToast(`${work.aName} est déjà complète (${MAX_TEAM_SIZE})`, 'warning');
        return;
      }
      A.push(id);
    } else if (zone === 'B') {
      if (!work.B.includes(id) && B.length >= MAX_TEAM_SIZE) {
        showToast(`${work.bName} est déjà complète (${MAX_TEAM_SIZE})`, 'warning');
        return;
      }
      B.push(id);
    } else if (zone === 'bench') {
      if (!work.bench.includes(id) && bench.length >= MAX_BENCH_SIZE) {
        showToast(`Le banc est complet (${MAX_BENCH_SIZE})`, 'warning');
        return;
      }
      bench.push(id);
    }
    // zone === 'pool' → already removed from all lists

    setWork({ ...work, A, B, bench });
    setSelectedId(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await updateTeamComposition({
        team_a: work.A,
        team_b: work.B,
        bench: work.bench,
        team_a_name: work.aName,
        team_b_name: work.bName,
      });
      setComposition(updated);
      setEditMode(false);
      setSelectedId(null);
      showToast('Composition enregistrée !', 'success');
    } catch (error: any) {
      const detail = error?.response?.data?.detail || "Échec de l'enregistrement";
      showToast(detail, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!composition) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-text-secondary">
        Impossible de charger la composition.
      </div>
    );
  }

  // Resolve what to display depending on the mode
  const resolve = (ids: number[]): ParticipantSummary[] =>
    ids.map((id) => allById.get(id)).filter((p): p is ParticipantSummary => !!p);

  const placedIds = new Set([...work.A, ...work.B, ...work.bench]);

  const display = editMode
    ? {
        aName: work.aName,
        bName: work.bName,
        teamA: resolve(work.A),
        teamB: resolve(work.B),
        bench: resolve(work.bench),
        unplaced: allOrdered.filter((p) => !placedIds.has(p.id)),
      }
    : {
        aName: composition.team_a_name,
        bName: composition.team_b_name,
        teamA: composition.team_a,
        teamB: composition.team_b,
        bench: composition.bench,
        unplaced: composition.unplaced,
      };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-wider text-gradient-psg">
          LE FIVE
        </h1>
        <p className="text-text-secondary mt-2">
          {editMode
            ? 'Sélectionne un joueur puis tape une équipe, le banc ou la zone « non répartis ».'
            : 'La composition du match 5 contre 5.'}
        </p>
      </div>

      {/* Edit controls */}
      {canEdit && (
        <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
          {!editMode ? (
            <button
              type="button"
              onClick={enterEdit}
              className="px-6 py-2.5 rounded-xl font-display font-bold uppercase tracking-wide text-white"
              style={{ background: 'linear-gradient(135deg, #004170 0%, #001E41 100%)' }}
            >
              ✏️ Composer les équipes
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl font-display font-bold uppercase tracking-wide text-black disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #00FF41 0%, #00cc34 100%)' }}
              >
                {saving ? 'Enregistrement…' : '💾 Enregistrer'}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl font-display font-bold uppercase tracking-wide text-white border border-white/20"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                Annuler
              </button>
            </>
          )}
        </div>
      )}

      {/* Team name inputs (edit mode) */}
      {editMode && (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
          <input
            value={work.aName}
            onChange={(e) => setWork({ ...work, aName: e.target.value })}
            maxLength={50}
            placeholder="Nom équipe A"
            className="px-4 py-2 rounded-lg bg-bg-card border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-psg-blue"
          />
          <input
            value={work.bName}
            onChange={(e) => setWork({ ...work, bName: e.target.value })}
            maxLength={50}
            placeholder="Nom équipe B"
            className="px-4 py-2 rounded-lg bg-bg-card border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-psg-red"
          />
        </div>
      )}

      {/* Pitch */}
      <FivePitch
        teamAName={display.aName}
        teamBName={display.bName}
        teamA={display.teamA}
        teamB={display.teamB}
        bench={display.bench}
        unplaced={display.unplaced}
        editMode={editMode}
        selectedId={selectedId}
        onPlayerClick={handlePlayerClick}
        onZoneClick={handleZoneClick}
      />

      {/* Card detail modal (view mode) */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle at center, #1A2942 0%, #0A1628 100%)',
              cursor: 'pointer',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setSelectedCard(null)}
          >
            <motion.img
              src={getAvatarUrl(selectedCard.name)}
              alt={selectedCard.name}
              className="w-80 h-[450px] sm:w-96 sm:h-[540px] object-contain"
              style={{
                filter: selectedCard.is_groom
                  ? 'drop-shadow(0 0 80px rgba(212, 175, 55, 0.9)) drop-shadow(0 0 40px rgba(255, 215, 0, 0.6))'
                  : 'drop-shadow(0 0 60px rgba(212, 175, 55, 0.7)) drop-shadow(0 0 30px rgba(255, 215, 0, 0.5))',
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onError={(e) => {
                e.currentTarget.src = getDefaultAvatarUrl();
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

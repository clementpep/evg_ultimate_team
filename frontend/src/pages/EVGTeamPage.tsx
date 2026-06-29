/**
 * EVGTeamPage - Shared 5v5 lineup.
 *
 * - View mode (everyone): symmetric five-a-side pitch with explicit roles.
 * - Edit mode (Paul the groom, or admin): tap a player, then tap a precise
 *   role slot, the bench, the referee zone or the unplaced pool.
 */

import { useState, useEffect, useMemo, useCallback, useRef, type SyntheticEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@context/AuthContext';
import { useToast } from '@context/ToastContext';
import { getTeamComposition, updateTeamComposition } from '@services/teamService';
import { getAvatarUrl, getDefaultAvatarUrl } from '@utils/avatarUtils';
import { ParticipantSummary } from '@/types/participant';
import {
  TeamComposition,
  TeamSlot,
  TEAM_ROLES,
  MAX_BENCH_SIZE,
  MAX_REFEREE_SIZE,
  type TeamRole,
} from '@/types/team';
import { FivePitch, PitchZone, type StarterSlotTarget } from '@components/team/FivePitch';
import { IoMdClose } from 'react-icons/io';

interface WorkState {
  A: Array<number | null>;
  B: Array<number | null>;
  bench: number[];
  referee: number[];
  aName: string;
  bName: string;
}

const EMPTY_TEAM_SLOTS: Array<number | null> = TEAM_ROLES.map(() => null);

const roleIndex = (role: TeamRole): number => TEAM_ROLES.indexOf(role);

const normalizeTeamSlots = (slots?: TeamSlot[]): Array<number | null> => {
  if (!slots || slots.length === 0) return [...EMPTY_TEAM_SLOTS];
  return TEAM_ROLES.map(
    (role) => slots.find((slot) => slot.role === role)?.participant?.id ?? null
  );
};

const resolveTeamSlots = (
  ids: Array<number | null>,
  allById: Map<number, ParticipantSummary>
): TeamSlot[] =>
  TEAM_ROLES.map((role, index) => ({
    role,
    participant: ids[index] !== null ? allById.get(ids[index]!) ?? null : null,
  }));

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
  const [work, setWork] = useState<WorkState>({
    A: [...EMPTY_TEAM_SLOTS],
    B: [...EMPTY_TEAM_SLOTS],
    bench: [],
    referee: [],
    aName: '',
    bName: '',
  });

  const allById = useMemo(() => {
    const map = new Map<number, ParticipantSummary>();
    if (composition) {
      [
        ...composition.team_a,
        ...composition.team_b,
        ...composition.bench,
        ...composition.referee,
        ...composition.unplaced,
      ].forEach((p) => map.set(p.id, p));
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
      A: normalizeTeamSlots(composition.team_a_slots),
      B: normalizeTeamSlots(composition.team_b_slots),
      bench: composition.bench.map((p) => p.id),
      referee: composition.referee.map((p) => p.id),
      aName: composition.team_a_name,
      bName: composition.team_b_name,
    });
    setSelectedId(null);
    setEditMode(true);
  }, [composition]);

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

  const handleStarterSlotClick = ({ team, role }: StarterSlotTarget) => {
    if (selectedId === null) return;
    const id = selectedId;

    const A = work.A.map((value) => (value === id ? null : value));
    const B = work.B.map((value) => (value === id ? null : value));
    const bench = work.bench.filter((x) => x !== id);
    const referee = work.referee.filter((x) => x !== id);

    const targetSlots = team === 'A' ? [...A] : [...B];
    targetSlots[roleIndex(role)] = id;

    setWork({
      ...work,
      A: team === 'A' ? targetSlots : A,
      B: team === 'B' ? targetSlots : B,
      bench,
      referee,
    });
    setSelectedId(null);
  };

  const handleZoneClick = (zone: PitchZone) => {
    if (selectedId === null) return;
    const id = selectedId;

    const A = work.A.map((value) => (value === id ? null : value));
    const B = work.B.map((value) => (value === id ? null : value));
    const bench = work.bench.filter((x) => x !== id);
    const referee = work.referee.filter((x) => x !== id);

    if (zone === 'bench') {
      if (!work.bench.includes(id) && bench.length >= MAX_BENCH_SIZE) {
        showToast(`Le banc est complet (${MAX_BENCH_SIZE})`, 'warning');
        return;
      }
      bench.push(id);
    } else if (zone === 'referee') {
      if (!work.referee.includes(id) && referee.length >= MAX_REFEREE_SIZE) {
        showToast('Il y a déjà un arbitre', 'warning');
        return;
      }
      referee.push(id);
    }

    setWork({ ...work, A, B, bench, referee });
    setSelectedId(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await updateTeamComposition({
        team_a: work.A,
        team_b: work.B,
        bench: work.bench,
        referee: work.referee,
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

  const resolve = (ids: Array<number | null>): ParticipantSummary[] =>
    ids
      .filter((id): id is number => id !== null)
      .map((id) => allById.get(id))
      .filter((p): p is ParticipantSummary => !!p);

  const placedIds = new Set(
    [...work.A, ...work.B, ...work.bench, ...work.referee].filter((id): id is number => id !== null)
  );

  const display = editMode
    ? {
        aName: work.aName,
        bName: work.bName,
        teamASlots: resolveTeamSlots(work.A, allById),
        teamBSlots: resolveTeamSlots(work.B, allById),
        bench: resolve(work.bench),
        referee: resolve(work.referee),
        unplaced: allOrdered.filter((p) => !placedIds.has(p.id)),
      }
    : {
        aName: composition.team_a_name,
        bName: composition.team_b_name,
        teamASlots: composition.team_a_slots,
        teamBSlots: composition.team_b_slots,
        bench: composition.bench,
        referee: composition.referee,
        unplaced: composition.unplaced,
      };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 text-center">
        <h1 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-wider text-gradient-psg">
          LE FIVE
        </h1>
        <p className="mt-2 text-text-secondary">
          {editMode
            ? 'Sélectionne un joueur puis place-le sur un vrai poste : gardien, défenseur, ailier gauche, ailier droit ou attaquant. Objectif : 2×5 + 1 arbitre + 2 remplaçants.'
            : 'La composition du match 5 contre 5 avec postes fixes et vue symétrique des deux équipes.'}
        </p>
      </div>

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
                className="px-6 py-2.5 rounded-xl border border-white/20 font-display font-bold uppercase tracking-wide text-white"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                Annuler
              </button>
            </>
          )}
        </div>
      )}

      {editMode && (
        <div className="mb-6 grid max-w-xl grid-cols-1 gap-3 mx-auto sm:grid-cols-2">
          <input
            value={work.aName}
            onChange={(e) => setWork({ ...work, aName: e.target.value })}
            maxLength={50}
            placeholder="Nom équipe A"
            className="rounded-lg border border-white/10 bg-bg-card px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-psg-blue"
          />
          <input
            value={work.bName}
            onChange={(e) => setWork({ ...work, bName: e.target.value })}
            maxLength={50}
            placeholder="Nom équipe B"
            className="rounded-lg border border-white/10 bg-bg-card px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-psg-red"
          />
        </div>
      )}

      <FivePitch
        teamAName={display.aName}
        teamBName={display.bName}
        teamASlots={display.teamASlots}
        teamBSlots={display.teamBSlots}
        bench={display.bench}
        referee={display.referee}
        unplaced={display.unplaced}
        editMode={editMode}
        selectedId={selectedId}
        onPlayerClick={handlePlayerClick}
        onStarterSlotClick={handleStarterSlotClick}
        onZoneClick={handleZoneClick}
      />

      <AnimatePresence>
        {selectedCard && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center px-3 py-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]"
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
            <div className="relative flex w-full max-w-sm flex-col items-center">
              <button
                type="button"
                onClick={() => setSelectedCard(null)}
                className="absolute right-0 top-0 z-10 rounded-2xl bg-black/35 p-2 text-white backdrop-blur transition hover:bg-black/55"
                aria-label="Fermer"
              >
                <IoMdClose className="text-2xl" />
              </button>

              <motion.img
                src={getAvatarUrl(selectedCard.name)}
                alt={selectedCard.name}
                className="h-[min(72vh,32rem)] w-full max-w-[20rem] object-contain sm:max-w-sm"
                style={{
                  filter: selectedCard.is_groom
                    ? 'drop-shadow(0 0 80px rgba(212, 175, 55, 0.9)) drop-shadow(0 0 40px rgba(255, 215, 0, 0.6))'
                    : 'drop-shadow(0 0 60px rgba(212, 175, 55, 0.7)) drop-shadow(0 0 30px rgba(255, 215, 0, 0.5))',
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                onError={(e: SyntheticEvent<HTMLImageElement>) => {
                  e.currentTarget.src = getDefaultAvatarUrl();
                }}
              />

              <div className="mt-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-center backdrop-blur">
                <p className="font-display text-lg uppercase tracking-wide text-white">{selectedCard.name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/55">
                  Touchez pour fermer
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

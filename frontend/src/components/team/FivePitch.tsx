/**
 * FivePitch - Symmetric 5v5 pitch with explicit roles for each team.
 *
 * Presentational only: the parent owns the working composition and the
 * tap-to-place logic. In edit mode, tapping a player selects it and tapping
 * a precise role slot moves the selected player there.
 */

import { ParticipantSummary } from '@/types/participant';
import { MAX_BENCH_SIZE, MAX_REFEREE_SIZE, TeamRole, TeamSlot } from '@/types/team';
import { PlayerChip } from './PlayerChip';

export type PitchZone = 'bench' | 'referee' | 'pool';

export interface StarterSlotTarget {
  team: 'A' | 'B';
  role: TeamRole;
}

interface FivePitchProps {
  teamAName: string;
  teamBName: string;
  teamASlots: TeamSlot[];
  teamBSlots: TeamSlot[];
  bench: ParticipantSummary[];
  referee: ParticipantSummary[];
  unplaced: ParticipantSummary[];
  editMode: boolean;
  selectedId: number | null;
  onPlayerClick: (participant: ParticipantSummary) => void;
  onStarterSlotClick: (target: StarterSlotTarget) => void;
  onZoneClick: (zone: PitchZone) => void;
}

const ROLE_LABELS: Record<TeamRole, string> = {
  goalkeeper: 'Gardien',
  defender: 'Défenseur',
  left_wing: 'Ailier gauche',
  right_wing: 'Ailier droit',
  striker: 'Attaquant',
};

const SLOT_LAYOUT: Array<{ role: TeamRole; top: string; left: string }> = [
  { role: 'goalkeeper', top: '81%', left: '50%' },
  { role: 'defender', top: '61%', left: '50%' },
  { role: 'left_wing', top: '38%', left: '28%' },
  { role: 'right_wing', top: '38%', left: '72%' },
  { role: 'striker', top: '18%', left: '50%' },
];

const mirrorTop = (top: string): string => `${100 - Number.parseFloat(top)}%`;

const EmptySlot: React.FC<{ onClick: () => void; active: boolean; label: string }> = ({ onClick, active, label }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex h-20 w-16 flex-col items-center justify-center rounded-xl border-2 border-dashed px-1 text-center transition-colors sm:h-24 sm:w-20"
    style={{
      borderColor: active ? 'rgba(0,255,65,0.85)' : 'rgba(255,255,255,0.28)',
      background: active ? 'rgba(0,255,65,0.1)' : 'rgba(8,14,28,0.36)',
      color: active ? 'rgba(0,255,65,0.95)' : 'rgba(255,255,255,0.56)',
      backdropFilter: 'blur(10px)',
    }}
    aria-label={`Emplacement libre ${label}`}
  >
    <span className="text-lg leading-none">+</span>
    <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.15em]">{label}</span>
  </button>
);

const StarterHalf: React.FC<{
  team: 'A' | 'B';
  name: string;
  color: 'blue' | 'red';
  slots: TeamSlot[];
  editMode: boolean;
  selectedId: number | null;
  onPlayerClick: (participant: ParticipantSummary) => void;
  onStarterSlotClick: (target: StarterSlotTarget) => void;
}> = ({ team, name, color, slots, editMode, selectedId, onPlayerClick, onStarterSlotClick }) => {
  const hasSelection = selectedId !== null;
  const positions = SLOT_LAYOUT.map((layout) => ({
    ...layout,
    top: team === 'A' ? layout.top : mirrorTop(layout.top),
  }));

  const chipSize = team === 'A' ? 'sm' : 'sm';

  return (
    <>
      <div
        className="absolute left-1/2 z-10 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-display font-bold uppercase tracking-[0.2em] sm:text-sm"
        style={{
          top: team === 'A' ? '4%' : 'unset',
          bottom: team === 'B' ? '4%' : 'unset',
          background:
            color === 'blue'
              ? 'linear-gradient(135deg, rgba(0,65,112,0.95) 0%, rgba(0,30,65,0.95) 100%)'
              : 'linear-gradient(135deg, rgba(218,41,28,0.95) 0%, rgba(160,33,21,0.95) 100%)',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.14)',
        }}
      >
        {name}
      </div>

      {positions.map(({ role, top, left }) => {
        const slot = slots.find((entry) => entry.role === role);
        const player = slot?.participant ?? null;

        return (
          <div
            key={`${team}-${role}`}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{ top, left }}
          >
            <div className="mb-1 rounded-full bg-black/35 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-white/75 backdrop-blur sm:text-[10px]">
              {ROLE_LABELS[role]}
            </div>
            {player ? (
              <PlayerChip
                participant={player}
                size={chipSize}
                selected={selectedId === player.id}
                showPoints={false}
                onClick={onPlayerClick}
              />
            ) : editMode ? (
              <EmptySlot
                label={ROLE_LABELS[role]}
                active={hasSelection}
                onClick={() => onStarterSlotClick({ team, role })}
              />
            ) : (
              <div className="flex h-20 w-16 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-[9px] font-bold uppercase tracking-[0.18em] text-white/45 backdrop-blur sm:h-24 sm:w-20 sm:text-[10px]">
                Vide
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

export const FivePitch: React.FC<FivePitchProps> = ({
  teamAName,
  teamBName,
  teamASlots,
  teamBSlots,
  bench,
  referee,
  unplaced,
  editMode,
  selectedId,
  onPlayerClick,
  onStarterSlotClick,
  onZoneClick,
}) => {
  const hasSelection = selectedId !== null;
  const benchFree = Math.max(0, MAX_BENCH_SIZE - bench.length);
  const refereeFree = Math.max(0, MAX_REFEREE_SIZE - referee.length);

  return (
    <div className="space-y-6">
      <div
        className="relative overflow-hidden rounded-[2rem] border"
        style={{
          minHeight: '42rem',
          background:
            'radial-gradient(circle at center, rgba(20,110,48,0.35) 0%, rgba(9,78,34,0.22) 26%, rgba(10,95,41,0.92) 27%, rgba(11,107,46,0.98) 100%)',
          borderColor: 'rgba(255,255,255,0.15)',
          boxShadow: 'inset 0 0 90px rgba(0,0,0,0.45)',
        }}
      >
        <div className="absolute inset-[4%] rounded-[1.75rem] border border-white/15" />
        <div className="absolute left-[14%] top-[7%] h-[18%] w-[72%] rounded-t-[9rem] border border-b-0 border-white/18" />
        <div className="absolute bottom-[7%] left-[14%] h-[18%] w-[72%] rounded-b-[9rem] border border-t-0 border-white/18" />
        <div className="absolute left-1/2 top-1/2 h-px w-[86%] -translate-x-1/2 -translate-y-1/2 bg-white/35" />
        <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/35 sm:h-28 sm:w-28" />
        <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60" />

        <StarterHalf
          team="A"
          name={teamAName}
          color="blue"
          slots={teamASlots}
          editMode={editMode}
          selectedId={selectedId}
          onPlayerClick={onPlayerClick}
          onStarterSlotClick={onStarterSlotClick}
        />

        <StarterHalf
          team="B"
          name={teamBName}
          color="red"
          slots={teamBSlots}
          editMode={editMode}
          selectedId={selectedId}
          onPlayerClick={onPlayerClick}
          onStarterSlotClick={onStarterSlotClick}
        />
      </div>

      <div
        className="rounded-xl border p-3 sm:p-4"
        style={{ background: 'rgba(66, 56, 16, 0.55)', borderColor: 'rgba(212, 175, 55, 0.35)' }}
        onClick={editMode && hasSelection ? () => onZoneClick('referee') : undefined}
      >
        <div className="mb-2 text-xs uppercase tracking-wide text-text-secondary sm:text-sm">
          🟨 Arbitre · {referee.length}/{MAX_REFEREE_SIZE}
        </div>
        <div className="flex min-h-[7rem] flex-wrap items-center justify-center gap-2 sm:gap-4">
          {referee.map((p) => (
            <PlayerChip key={p.id} participant={p} size="sm" selected={selectedId === p.id} onClick={onPlayerClick} />
          ))}
          {editMode &&
            Array.from({ length: refereeFree }).map((_, i) => (
              <EmptySlot key={`ref-${i}`} active={hasSelection} label="Arbitre" onClick={() => onZoneClick('referee')} />
            ))}
          {!editMode && referee.length === 0 && <span className="text-sm text-text-secondary">Pas d'arbitre désigné</span>}
        </div>
      </div>

      <div
        className="rounded-xl border p-3 sm:p-4"
        style={{ background: 'rgba(26, 41, 66, 0.6)', borderColor: 'rgba(255,255,255,0.1)' }}
        onClick={editMode && hasSelection ? () => onZoneClick('bench') : undefined}
      >
        <div className="mb-2 text-xs uppercase tracking-wide text-text-secondary sm:text-sm">
          🪑 Remplaçants · {bench.length}/{MAX_BENCH_SIZE}
        </div>
        <div className="flex min-h-[7rem] flex-wrap items-center justify-center gap-2 sm:gap-4">
          {bench.map((p) => (
            <PlayerChip key={p.id} participant={p} size="sm" selected={selectedId === p.id} onClick={onPlayerClick} />
          ))}
          {editMode &&
            Array.from({ length: benchFree }).map((_, i) => (
              <EmptySlot key={`bench-${i}`} active={hasSelection} label="Banc" onClick={() => onZoneClick('bench')} />
            ))}
          {!editMode && bench.length === 0 && <span className="text-sm text-text-secondary">Aucun remplaçant</span>}
        </div>
      </div>

      {(editMode || unplaced.length > 0) && (
        <div
          className="rounded-xl border p-3 sm:p-4"
          style={{ background: 'rgba(10, 22, 40, 0.6)', borderColor: 'rgba(255,255,255,0.1)' }}
          onClick={editMode && hasSelection ? () => onZoneClick('pool') : undefined}
        >
          <div className="mb-2 text-xs uppercase tracking-wide text-text-secondary sm:text-sm">
            {editMode ? 'Non répartis (tape pour renvoyer ici)' : 'Non répartis'} · {unplaced.length}
          </div>
          <div className="flex min-h-[7rem] flex-wrap items-center justify-center gap-2 sm:gap-4">
            {unplaced.map((p) => (
              <PlayerChip key={p.id} participant={p} size="sm" selected={selectedId === p.id} onClick={onPlayerClick} />
            ))}
            {unplaced.length === 0 && <span className="text-sm text-text-secondary">Tout le monde est placé ✅</span>}
          </div>
        </div>
      )}
    </div>
  );
};

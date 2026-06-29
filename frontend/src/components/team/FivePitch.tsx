/**
 * FivePitch - Symmetric 5v5 pitch with explicit roles for each team.
 *
 * Presentational only: the parent owns the working composition and the
 * tap-to-place logic. In edit mode, tapping a player selects it and tapping
 * a precise role slot moves the selected player there.
 *
 * Layout: the green pitch + markings are a decorative background layer. The
 * players flow inside a flex column (Team B on the top half, Team A on the
 * bottom half), so positions can never overlap — even on narrow phones.
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
  left_wing: 'Ailier G.',
  right_wing: 'Ailier D.',
  striker: 'Attaquant',
};

// Rows from each team's own goal line towards the center line.
const TEAM_A_ROWS: TeamRole[][] = [
  ['striker'],
  ['left_wing', 'right_wing'],
  ['defender'],
  ['goalkeeper'],
];
const TEAM_B_ROWS: TeamRole[][] = [
  ['goalkeeper'],
  ['defender'],
  ['left_wing', 'right_wing'],
  ['striker'],
];

const SLOT_FOOTPRINT = 'h-[4.5rem] w-14 sm:h-24 sm:w-20';

const EmptySlot: React.FC<{ onClick: () => void; active: boolean; label: string }> = ({
  onClick,
  active,
  label,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-1 text-center transition-colors ${SLOT_FOOTPRINT}`}
    style={{
      borderColor: active ? 'rgba(0,255,65,0.85)' : 'rgba(255,255,255,0.3)',
      background: active ? 'rgba(0,255,65,0.12)' : 'rgba(8,14,28,0.45)',
      color: active ? 'rgba(0,255,65,0.95)' : 'rgba(255,255,255,0.6)',
      backdropFilter: 'blur(8px)',
    }}
    aria-label={`Emplacement libre ${label}`}
  >
    <span className="text-base leading-none sm:text-lg">+</span>
  </button>
);

/** One role position: label on top, then the player card / empty slot / "Vide". */
const SlotCell: React.FC<{
  team: 'A' | 'B';
  role: TeamRole;
  player: ParticipantSummary | null;
  editMode: boolean;
  selectedId: number | null;
  onPlayerClick: (participant: ParticipantSummary) => void;
  onStarterSlotClick: (target: StarterSlotTarget) => void;
}> = ({ team, role, player, editMode, selectedId, onPlayerClick, onStarterSlotClick }) => (
  <div className="flex flex-col items-center gap-1">
    <span className="rounded-full bg-black/45 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-white/80 backdrop-blur sm:text-[10px]">
      {ROLE_LABELS[role]}
    </span>
    {player ? (
      <PlayerChip
        participant={player}
        size="sm"
        selected={selectedId === player.id}
        showPoints={false}
        onClick={onPlayerClick}
      />
    ) : editMode ? (
      <EmptySlot
        label={ROLE_LABELS[role]}
        active={selectedId !== null}
        onClick={() => onStarterSlotClick({ team, role })}
      />
    ) : (
      <div
        className={`flex items-center justify-center rounded-xl border border-white/10 bg-black/25 text-[8px] font-bold uppercase tracking-[0.15em] text-white/45 backdrop-blur sm:text-[10px] ${SLOT_FOOTPRINT}`}
      >
        Vide
      </div>
    )}
  </div>
);

const TeamHalf: React.FC<{
  team: 'A' | 'B';
  name: string;
  color: 'blue' | 'red';
  slots: TeamSlot[];
  rows: TeamRole[][];
  editMode: boolean;
  selectedId: number | null;
  onPlayerClick: (participant: ParticipantSummary) => void;
  onStarterSlotClick: (target: StarterSlotTarget) => void;
}> = ({ team, name, color, slots, rows, editMode, selectedId, onPlayerClick, onStarterSlotClick }) => {
  const playerFor = (role: TeamRole) => slots.find((s) => s.role === role)?.participant ?? null;

  const badge = (
    <div
      className="mx-auto rounded-full px-4 py-1 text-xs font-display font-bold uppercase tracking-[0.2em] text-white shadow-lg sm:text-sm"
      style={{
        background:
          color === 'blue'
            ? 'linear-gradient(135deg, rgba(0,65,112,0.95) 0%, rgba(0,30,65,0.95) 100%)'
            : 'linear-gradient(135deg, rgba(218,41,28,0.95) 0%, rgba(160,33,21,0.95) 100%)',
        border: '1px solid rgba(255,255,255,0.16)',
      }}
    >
      {name}
    </div>
  );

  const rowEls = rows.map((roles, i) => (
    <div
      key={`${team}-row-${i}`}
      className={
        roles.length > 1
          ? 'mx-auto flex w-full max-w-[16rem] items-start justify-between px-1 sm:max-w-xs'
          : 'flex items-start justify-center'
      }
    >
      {roles.map((role) => (
        <SlotCell
          key={`${team}-${role}`}
          team={team}
          role={role}
          player={playerFor(role)}
          editMode={editMode}
          selectedId={selectedId}
          onPlayerClick={onPlayerClick}
          onStarterSlotClick={onStarterSlotClick}
        />
      ))}
    </div>
  ));

  return (
    <div className="flex flex-1 flex-col justify-evenly gap-3 py-2">
      {team === 'B' && badge}
      {rowEls}
      {team === 'A' && badge}
    </div>
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
          background:
            'radial-gradient(circle at center, rgba(20,110,48,0.35) 0%, rgba(9,78,34,0.22) 26%, rgba(10,95,41,0.92) 27%, rgba(11,107,46,0.98) 100%)',
          borderColor: 'rgba(255,255,255,0.15)',
          boxShadow: 'inset 0 0 90px rgba(0,0,0,0.45)',
        }}
      >
        {/* Decorative pitch markings (background layer) */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-[4%] rounded-[1.75rem] border border-white/15" />
          <div className="absolute left-[14%] top-[2%] h-[14%] w-[72%] rounded-b-[7rem] border border-t-0 border-white/18" />
          <div className="absolute bottom-[2%] left-[14%] h-[14%] w-[72%] rounded-t-[7rem] border border-b-0 border-white/18" />
          <div className="absolute left-1/2 top-1/2 h-px w-[86%] -translate-x-1/2 -translate-y-1/2 bg-white/35" />
          <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/35 sm:h-28 sm:w-28" />
          <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60" />
        </div>

        {/* Players flow (foreground) — flex column, never overlaps */}
        <div className="relative z-10 flex min-h-[36rem] flex-col px-2 py-4 sm:min-h-[40rem]">
          <TeamHalf
            team="B"
            name={teamBName}
            color="red"
            slots={teamBSlots}
            rows={TEAM_B_ROWS}
            editMode={editMode}
            selectedId={selectedId}
            onPlayerClick={onPlayerClick}
            onStarterSlotClick={onStarterSlotClick}
          />
          <div className="h-px w-full" />
          <TeamHalf
            team="A"
            name={teamAName}
            color="blue"
            slots={teamASlots}
            rows={TEAM_A_ROWS}
            editMode={editMode}
            selectedId={selectedId}
            onPlayerClick={onPlayerClick}
            onStarterSlotClick={onStarterSlotClick}
          />
        </div>
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

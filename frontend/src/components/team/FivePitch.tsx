/**
 * FivePitch - Visual 5v5 pitch with two teams, a bench and the unplaced pool.
 *
 * Presentational only: the parent owns the working composition and the
 * tap-to-place logic. In edit mode, tapping a player selects it and tapping
 * a zone (or an empty slot) moves the selected player there.
 */

import { ParticipantSummary } from '@/types/participant';
import { MAX_TEAM_SIZE, MAX_BENCH_SIZE } from '@/types/team';
import { PlayerChip } from './PlayerChip';

export type PitchZone = 'A' | 'B' | 'bench' | 'pool';

interface FivePitchProps {
  teamAName: string;
  teamBName: string;
  teamA: ParticipantSummary[];
  teamB: ParticipantSummary[];
  bench: ParticipantSummary[];
  unplaced: ParticipantSummary[];
  editMode: boolean;
  selectedId: number | null;
  onPlayerClick: (participant: ParticipantSummary) => void;
  onZoneClick: (zone: PitchZone) => void;
}

const EmptySlot: React.FC<{ onClick: () => void; active: boolean }> = ({ onClick, active }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-20 h-28 sm:w-24 sm:h-32 rounded-lg flex items-center justify-center text-2xl transition-colors"
    style={{
      border: `2px dashed ${active ? 'rgba(0,255,65,0.8)' : 'rgba(255,255,255,0.25)'}`,
      background: active ? 'rgba(0,255,65,0.08)' : 'rgba(255,255,255,0.03)',
      color: active ? 'rgba(0,255,65,0.9)' : 'rgba(255,255,255,0.4)',
    }}
    aria-label="Emplacement libre"
  >
    +
  </button>
);

const TeamHalf: React.FC<{
  zone: 'A' | 'B';
  name: string;
  players: ParticipantSummary[];
  editMode: boolean;
  selectedId: number | null;
  onPlayerClick: (p: ParticipantSummary) => void;
  onZoneClick: (z: PitchZone) => void;
}> = ({ zone, name, players, editMode, selectedId, onPlayerClick, onZoneClick }) => {
  const freeSlots = Math.max(0, MAX_TEAM_SIZE - players.length);
  const hasSelection = selectedId !== null;

  return (
    <div
      className="relative flex-1 p-3 sm:p-4"
      onClick={editMode && hasSelection ? () => onZoneClick(zone) : undefined}
    >
      <div
        className="inline-block mb-2 px-3 py-1 rounded-full text-xs sm:text-sm font-display font-bold uppercase tracking-wider"
        style={{
          background: zone === 'A'
            ? 'linear-gradient(135deg, #004170 0%, #001E41 100%)'
            : 'linear-gradient(135deg, #DA291C 0%, #A02115 100%)',
          color: '#fff',
        }}
      >
        {name} · {players.length}/{MAX_TEAM_SIZE}
      </div>

      <div className="flex flex-wrap justify-center items-start gap-2 sm:gap-4">
        {players.map((p) => (
          <div key={p.id} onClick={(e) => { e.stopPropagation(); onPlayerClick(p); }}>
            <PlayerChip participant={p} size="md" selected={selectedId === p.id} />
          </div>
        ))}
        {editMode &&
          Array.from({ length: freeSlots }).map((_, i) => (
            <EmptySlot
              key={`slot-${zone}-${i}`}
              active={hasSelection}
              onClick={() => onZoneClick(zone)}
            />
          ))}
      </div>
    </div>
  );
};

export const FivePitch: React.FC<FivePitchProps> = ({
  teamAName,
  teamBName,
  teamA,
  teamB,
  bench,
  unplaced,
  editMode,
  selectedId,
  onPlayerClick,
  onZoneClick,
}) => {
  const hasSelection = selectedId !== null;
  const benchFree = Math.max(0, MAX_BENCH_SIZE - bench.length);

  return (
    <div className="space-y-6">
      {/* Pitch */}
      <div
        className="relative rounded-2xl overflow-hidden border"
        style={{
          background:
            'repeating-linear-gradient(0deg, #0b6b2e 0px, #0b6b2e 40px, #0a5f29 40px, #0a5f29 80px)',
          borderColor: 'rgba(255,255,255,0.15)',
          boxShadow: 'inset 0 0 60px rgba(0,0,0,0.4)',
        }}
      >
        {/* Center line + circle */}
        <div className="absolute left-0 right-0 top-1/2 h-px bg-white/40" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-white/40" />

        <div className="relative flex flex-col">
          <TeamHalf
            zone="A"
            name={teamAName}
            players={teamA}
            editMode={editMode}
            selectedId={selectedId}
            onPlayerClick={onPlayerClick}
            onZoneClick={onZoneClick}
          />
          <TeamHalf
            zone="B"
            name={teamBName}
            players={teamB}
            editMode={editMode}
            selectedId={selectedId}
            onPlayerClick={onPlayerClick}
            onZoneClick={onZoneClick}
          />
        </div>
      </div>

      {/* Bench */}
      <div
        className="rounded-xl p-3 sm:p-4 border"
        style={{ background: 'rgba(26, 41, 66, 0.6)', borderColor: 'rgba(255,255,255,0.1)' }}
        onClick={editMode && hasSelection ? () => onZoneClick('bench') : undefined}
      >
        <div className="text-text-secondary text-xs sm:text-sm uppercase tracking-wide mb-2">
          🪑 Remplaçants · {bench.length}/{MAX_BENCH_SIZE}
        </div>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 min-h-[7rem] items-center">
          {bench.map((p) => (
            <div key={p.id} onClick={(e) => { e.stopPropagation(); onPlayerClick(p); }}>
              <PlayerChip participant={p} size="md" selected={selectedId === p.id} />
            </div>
          ))}
          {editMode &&
            Array.from({ length: benchFree }).map((_, i) => (
              <EmptySlot key={`bench-${i}`} active={hasSelection} onClick={() => onZoneClick('bench')} />
            ))}
          {!editMode && bench.length === 0 && (
            <span className="text-text-secondary text-sm">Aucun remplaçant</span>
          )}
        </div>
      </div>

      {/* Unplaced pool */}
      {(editMode || unplaced.length > 0) && (
        <div
          className="rounded-xl p-3 sm:p-4 border"
          style={{ background: 'rgba(10, 22, 40, 0.6)', borderColor: 'rgba(255,255,255,0.1)' }}
          onClick={editMode && hasSelection ? () => onZoneClick('pool') : undefined}
        >
          <div className="text-text-secondary text-xs sm:text-sm uppercase tracking-wide mb-2">
            {editMode ? 'Non répartis (tape pour renvoyer ici)' : 'Non répartis'} · {unplaced.length}
          </div>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 min-h-[7rem] items-center">
            {unplaced.map((p) => (
              <div key={p.id} onClick={(e) => { e.stopPropagation(); onPlayerClick(p); }}>
                <PlayerChip participant={p} size="md" selected={selectedId === p.id} />
              </div>
            ))}
            {unplaced.length === 0 && (
              <span className="text-text-secondary text-sm">Tout le monde est placé ✅</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

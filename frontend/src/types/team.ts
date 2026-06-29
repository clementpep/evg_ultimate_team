/**
 * Team composition type definitions (shared 5v5 lineup).
 *
 * Mirrors backend schemas in app/schemas/team.py.
 */

import { ParticipantSummary } from './participant';

export const TEAM_ROLES = ['goalkeeper', 'defender', 'left_wing', 'right_wing', 'striker'] as const;
export type TeamRole = typeof TEAM_ROLES[number];

export interface TeamSlot {
  role: TeamRole;
  participant: ParticipantSummary | null;
}

export interface TeamComposition {
  team_a_name: string;
  team_b_name: string;
  team_a: ParticipantSummary[];
  team_b: ParticipantSummary[];
  team_a_slots: TeamSlot[];
  team_b_slots: TeamSlot[];
  bench: ParticipantSummary[];
  referee: ParticipantSummary[];
  unplaced: ParticipantSummary[];
  updated_at: string | null;
}

export interface TeamCompositionUpdate {
  team_a: Array<number | null>;
  team_b: Array<number | null>;
  bench: number[];
  referee: number[];
  team_a_name?: string;
  team_b_name?: string;
}

/** Capacity limits for the five-a-side format. */
export const MAX_TEAM_SIZE = 5;
export const MAX_BENCH_SIZE = 3;
export const MAX_REFEREE_SIZE = 1;

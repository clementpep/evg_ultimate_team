/**
 * Team composition type definitions (shared 5v5 lineup).
 *
 * Mirrors backend schemas in app/schemas/team.py.
 */

import { ParticipantSummary } from './participant';

export interface TeamComposition {
  team_a_name: string;
  team_b_name: string;
  team_a: ParticipantSummary[];
  team_b: ParticipantSummary[];
  bench: ParticipantSummary[];
  unplaced: ParticipantSummary[];
  updated_at: string | null;
}

export interface TeamCompositionUpdate {
  team_a: number[];
  team_b: number[];
  bench: number[];
  team_a_name?: string;
  team_b_name?: string;
}

/** Capacity limits for the five-a-side format. */
export const MAX_TEAM_SIZE = 5;
export const MAX_BENCH_SIZE = 3;

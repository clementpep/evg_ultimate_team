/**
 * Participant type definitions for EVG Ultimate Team frontend.
 *
 * These types mirror the backend Pydantic schemas.
 */

export interface Participant {
  id: number;
  name: string;
  avatar_url: string | null;
  is_groom: boolean;
  total_points: number;
  pack_credits: number;
  current_packs: PackInventory;
  created_at: string;
  updated_at: string;
}

export interface PackInventory {
  bronze: number;
  silver: number;
  gold: number;
  ultimate: number;
}

export interface ParticipantSummary {
  id: number;
  name: string;
  avatar_url: string | null;
  is_groom: boolean;
  total_points: number;
  pack_credits: number;
}

export interface ParticipantWithRank extends ParticipantSummary {
  rank: number;
  points_today?: number;
}

export interface ParticipantCreate {
  name: string;
  avatar_url?: string | null;
  is_groom?: boolean;
}

export interface ParticipantUpdate {
  name?: string;
  avatar_url?: string | null;
  is_groom?: boolean;
}

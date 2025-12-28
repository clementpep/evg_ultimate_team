/**
 * Challenge type definitions for EVG Ultimate Team frontend.
 */

export enum ChallengeType {
  INDIVIDUAL = "individual",
  TEAM = "team",
  SECRET = "secret",
}

export enum ChallengeStatus {
  PENDING = "pending",
  ACTIVE = "active",
  COMPLETED = "completed",
  FAILED = "failed",
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  type: ChallengeType;
  points: number;
  status: ChallengeStatus;
  assigned_to: number[];
  completed_by: number[];
  validated_by: number | null;
  created_at: string;
  completed_at: string | null;
  updated_at: string;
}

export interface ChallengeSummary {
  id: number;
  title: string;
  type: ChallengeType;
  points: number;
  status: ChallengeStatus;
}

export interface ChallengeCreate {
  title: string;
  description: string;
  type: ChallengeType;
  points: number;
  assigned_to?: number[];
}

export interface ChallengeUpdate {
  title?: string;
  description?: string;
  type?: ChallengeType;
  points?: number;
  status?: ChallengeStatus;
}

export interface ChallengeValidation {
  participant_ids: number[];
  status: ChallengeStatus;
  admin_id: number;
}

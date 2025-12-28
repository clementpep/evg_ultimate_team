/**
 * Points and transaction type definitions for EVG Ultimate Team frontend.
 */

export interface PointsTransaction {
  id: number;
  participant_id: number;
  amount: number;
  reason: string;
  challenge_id: number | null;
  created_by: number | null;
  created_at: string;
}

export interface PointsHistory {
  participant_id: number;
  participant_name: string;
  current_points: number;
  transactions: PointsTransaction[];
  total_transactions: number;
}

export interface PointsAdd {
  participant_id: number;
  amount: number;
  reason: string;
  admin_id: number;
}

export interface PointsSubtract {
  participant_id: number;
  amount: number;
  reason: string;
  admin_id: number;
}

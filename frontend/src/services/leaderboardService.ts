/**
 * Leaderboard service for EVG Ultimate Team frontend.
 *
 * Handles all leaderboard-related API calls.
 */

import apiClient from './api';
import { ParticipantWithRank } from '@/types/participant';
import { APIResponse } from '@/types/api';

/**
 * Get the full leaderboard.
 */
export const getLeaderboard = async (includeToday = false): Promise<ParticipantWithRank[]> => {
  const response = await apiClient.get<APIResponse<ParticipantWithRank[]>>('/leaderboard', {
    params: { include_today: includeToday },
  });

  return response.data.data || [];
};

/**
 * Get the top 3 participants (podium).
 */
export const getTop3 = async (): Promise<ParticipantWithRank[]> => {
  const response = await apiClient.get<APIResponse<ParticipantWithRank[]>>('/leaderboard/top-3');

  return response.data.data || [];
};

/**
 * Get the daily leader.
 */
export const getDailyLeader = async (): Promise<ParticipantWithRank | null> => {
  const response = await apiClient.get<APIResponse<ParticipantWithRank>>('/leaderboard/daily');

  return response.data.data || null;
};

/**
 * Get a participant's rank.
 */
export const getParticipantRank = async (
  participantId: number
): Promise<{ participant_id: number; rank: number }> => {
  const response = await apiClient.get<APIResponse<{ participant_id: number; rank: number }>>(
    `/leaderboard/rank/${participantId}`
  );

  if (response.data.data) {
    return response.data.data;
  }

  throw new Error('Failed to get participant rank');
};

/**
 * Get leaderboard statistics.
 */
export const getLeaderboardStats = async (): Promise<{
  total_participants: number;
  average_points: number;
  highest_points: number;
  lowest_points: number;
  total_points_distributed: number;
}> => {
  const response = await apiClient.get<
    APIResponse<{
      total_participants: number;
      average_points: number;
      highest_points: number;
      lowest_points: number;
      total_points_distributed: number;
    }>
  >('/leaderboard/stats');

  if (response.data.data) {
    return response.data.data;
  }

  throw new Error('Failed to get leaderboard stats');
};

/**
 * Team service for EVG Ultimate Team frontend.
 *
 * Handles API calls for the shared 5v5 lineup.
 */

import apiClient from './api';
import { APIResponse } from '@/types/api';
import { TeamComposition, TeamCompositionUpdate } from '@/types/team';

/**
 * Get the shared team composition (readable by any authenticated user).
 */
export const getTeamComposition = async (): Promise<TeamComposition> => {
  const response = await apiClient.get<APIResponse<TeamComposition>>('/team/composition');
  if (!response.data.data) {
    throw new Error('Failed to load team composition');
  }
  return response.data.data;
};

/**
 * Update the shared team composition (groom or admin only).
 */
export const updateTeamComposition = async (
  payload: TeamCompositionUpdate
): Promise<TeamComposition> => {
  const response = await apiClient.put<APIResponse<TeamComposition>>(
    '/team/composition',
    payload
  );
  if (!response.data.data) {
    throw new Error('Failed to update team composition');
  }
  return response.data.data;
};

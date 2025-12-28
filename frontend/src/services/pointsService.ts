/**
 * Points service for EVG Ultimate Team frontend.
 *
 * Handles all points-related API calls.
 */

import apiClient from './api';
import {
  PointsTransaction,
  PointsHistory,
  PointsAdd,
  PointsSubtract,
} from '@types/points';
import { APIResponse } from '@types/api';

/**
 * Add points to a participant (admin only).
 */
export const addPoints = async (data: PointsAdd): Promise<PointsTransaction> => {
  const response = await apiClient.post<APIResponse<PointsTransaction>>('/points/add', data);

  if (response.data.data) {
    return response.data.data;
  }

  throw new Error('Failed to add points');
};

/**
 * Subtract points from a participant (admin only).
 */
export const subtractPoints = async (data: PointsSubtract): Promise<PointsTransaction> => {
  const response = await apiClient.post<APIResponse<PointsTransaction>>(
    '/points/subtract',
    data
  );

  if (response.data.data) {
    return response.data.data;
  }

  throw new Error('Failed to subtract points');
};

/**
 * Get points history for a participant.
 */
export const getPointsHistory = async (
  participantId: number,
  skip = 0,
  limit = 100
): Promise<PointsHistory> => {
  const response = await apiClient.get<APIResponse<PointsHistory>>(
    `/points/history/${participantId}`,
    { params: { skip, limit } }
  );

  if (response.data.data) {
    return response.data.data;
  }

  throw new Error('Failed to get points history');
};

/**
 * Get recent transactions across all participants.
 */
export const getRecentTransactions = async (limit = 10): Promise<PointsTransaction[]> => {
  const response = await apiClient.get<APIResponse<PointsTransaction[]>>('/points/recent', {
    params: { limit },
  });

  return response.data.data || [];
};

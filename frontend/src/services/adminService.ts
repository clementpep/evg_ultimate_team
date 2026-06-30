/**
 * Admin Service - API calls for admin operations
 */

import apiClient from './api';
import { APIResponse } from '@/types/api';
import { PackRewardAdmin, PackRewardCreate, PackRewardUpdate } from '@/types/pack';
import { clearAppState } from './authService';

/**
 * Reset the entire database (DANGER ZONE)
 *
 * Drops all tables, recreates schema, and re-seeds with initial data.
 * This action is IRREVERSIBLE.
 *
 * @returns Success message
 */
export const resetDatabase = async (): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post('/admin/reset-database');
  clearAppState();
  return response.data;
};

// =============================================================================
// Pack Reward Catalogue (admin CRUD)
// =============================================================================

/** List the full reward catalogue (active and inactive). */
export const getRewardCatalogue = async (): Promise<PackRewardAdmin[]> => {
  const response = await apiClient.get<APIResponse<PackRewardAdmin[]>>('/packs/admin/rewards');
  return response.data.data || [];
};

/** Create a new pack reward. */
export const createReward = async (data: PackRewardCreate): Promise<PackRewardAdmin> => {
  const response = await apiClient.post<APIResponse<PackRewardAdmin>>('/packs/admin/rewards', data);
  if (response.data.data) return response.data.data;
  throw new Error('Failed to create reward');
};

/** Update an existing pack reward. */
export const updateReward = async (
  id: number,
  data: PackRewardUpdate
): Promise<PackRewardAdmin> => {
  const response = await apiClient.put<APIResponse<PackRewardAdmin>>(
    `/packs/admin/rewards/${id}`,
    data
  );
  if (response.data.data) return response.data.data;
  throw new Error('Failed to update reward');
};

/** Delete a pack reward. */
export const deleteReward = async (id: number): Promise<void> => {
  await apiClient.delete(`/packs/admin/rewards/${id}`);
};

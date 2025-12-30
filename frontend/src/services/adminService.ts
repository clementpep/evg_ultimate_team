/**
 * Admin Service - API calls for admin operations
 */

import apiClient from './api';

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
  return response.data;
};

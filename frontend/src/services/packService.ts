/**
 * Pack service for EVG Ultimate Team frontend.
 *
 * Handles all API calls for pack operations.
 */

import api from './api';
import { PackInventory, PackOpenResult, PackOpening } from '../types/pack';

export const packService = {
  /**
   * Get current pack inventory for the authenticated user.
   */
  getInventory: async (): Promise<PackInventory> => {
    const response = await api.get('/packs/inventory');
    return response.data.data;
  },

  /**
   * Purchase a pack with points.
   */
  purchasePack: async (tier: string): Promise<PackInventory> => {
    const response = await api.post('/packs/purchase', { tier });
    return response.data.data;
  },

  /**
   * Open a pack of the specified tier.
   */
  openPack: async (tier: string): Promise<PackOpenResult> => {
    const response = await api.post('/packs/open', { tier });
    return response.data.data;
  },

  /**
   * Get pack opening history.
   */
  getHistory: async (): Promise<PackOpening[]> => {
    const response = await api.get('/packs/history');
    return response.data.data;
  },

  /**
   * Get pack costs for all tiers.
   */
  getCosts: async (): Promise<Record<string, number>> => {
    const response = await api.get('/packs/costs');
    return response.data.data;
  },

  /**
   * Get possible rewards for a specific tier (preview).
   */
  getRewards: async (tier: string): Promise<any[]> => {
    const response = await api.get(`/packs/rewards/${tier}`);
    return response.data.data;
  },
};

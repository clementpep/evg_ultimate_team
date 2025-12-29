/**
 * Custom hook for pack operations.
 *
 * Manages pack inventory state and pack opening operations.
 */

import { useState, useEffect, useCallback } from 'react';
import { packService } from '../services/packService';
import { PackInventory, PackOpenResult } from '../types/pack';

export const usePacks = () => {
  const [inventory, setInventory] = useState<PackInventory | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const data = await packService.getInventory();
      setInventory(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch pack inventory');
      console.error('Error fetching pack inventory:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const purchasePack = useCallback(async (tier: string): Promise<boolean> => {
    try {
      setError(null);
      const newInventory = await packService.purchasePack(tier);
      setInventory(newInventory);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to purchase pack';
      setError(errorMessage);
      console.error('Error purchasing pack:', err);
      return false;
    }
  }, []);

  const openPack = useCallback(async (tier: string): Promise<PackOpenResult | null> => {
    try {
      setIsOpening(true);
      setError(null);
      const result = await packService.openPack(tier);
      await fetchInventory(); // Refresh inventory after opening
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to open pack';
      setError(errorMessage);
      console.error('Error opening pack:', err);
      return null;
    } finally {
      setIsOpening(false);
    }
  }, [fetchInventory]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return {
    inventory,
    loading,
    error,
    isOpening,
    purchasePack,
    openPack,
    refreshInventory: fetchInventory,
  };
};

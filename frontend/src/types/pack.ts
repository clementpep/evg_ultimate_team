/**
 * TypeScript types for pack system.
 *
 * Defines all types and interfaces for pack opening functionality.
 */

export interface PackInventory {
  bronze: number;
  silver: number;
  gold: number;
  ultimate: number;
}

export interface PackReward {
  id: number;
  name: string;
  description: string;
  type: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface PackOpenResult {
  success: boolean;
  reward: PackReward;
  new_inventory: PackInventory;
  animation_data: {
    duration: number;
    rarity: string;
    effects: string[];
  };
}

export interface PackOpening {
  id: number;
  pack_tier: string;
  reward_name: string;
  reward_description?: string;
  opened_at: string;
  points_spent: number;
}

export type PackTier = 'bronze' | 'silver' | 'gold' | 'ultimate';

export interface PackConfig {
  tier: PackTier;
  cost: number;
  color: string;
  glowColor: string;
  name: string;
}

export const PACK_CONFIG: Record<PackTier, PackConfig> = {
  bronze: {
    tier: 'bronze',
    cost: 100,
    color: '#CD7F32',
    glowColor: 'rgba(205, 127, 50, 0.5)',
    name: 'Bronze Pack',
  },
  silver: {
    tier: 'silver',
    cost: 200,
    color: '#C0C0C0',
    glowColor: 'rgba(192, 192, 192, 0.5)',
    name: 'Silver Pack',
  },
  gold: {
    tier: 'gold',
    cost: 300,
    color: '#D4AF37',
    glowColor: 'rgba(212, 175, 55, 0.6)',
    name: 'Gold Pack',
  },
  ultimate: {
    tier: 'ultimate',
    cost: 500,
    color: '#DA291C',
    glowColor: 'rgba(218, 41, 28, 0.6)',
    name: 'Ultimate Pack',
  },
};

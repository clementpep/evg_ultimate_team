/**
 * Avatar Utilities - Username to FUT Card mapping
 *
 * Maps usernames to FUT card images imported from assets
 */

import { futCards, defaultFutCard } from '../assets/futCards';

/**
 * Normalize username to match filename pattern
 * Example: "Paul C." → "paulc"
 * Example: "Clément P." → "clementp"
 */
export const normalizeUsername = (username: string): string => {
  return username
    .toLowerCase()
    .normalize('NFD')         // Decompose accented characters (é → e + accent)
    .replace(/[\u0300-\u036f]/g, '')  // Remove diacritics (accents)
    .replace(/\s+/g, '')      // Remove spaces
    .replace(/\./g, '')       // Remove periods
    .replace(/[^a-z]/g, '');  // Keep only letters
};

/**
 * Get avatar URL from username
 * Maps to FUT card images imported from assets
 */
export const getAvatarUrl = (username: string): string => {
  const normalized = normalizeUsername(username);
  return futCards[normalized] || defaultFutCard;
};

/**
 * Get default/fallback avatar URL
 * Used when user-specific card doesn't exist
 * Uses Paul C.'s card (the groom) as fallback
 */
export const getDefaultAvatarUrl = (): string => {
  return defaultFutCard;
};

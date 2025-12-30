/**
 * Avatar Utilities - Username to FUT Card mapping
 *
 * Maps usernames to FUT card images in /public
 */

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
 * Maps to FUT card images: /fut_card_{normalized_username}.png
 */
export const getAvatarUrl = (username: string): string => {
  const normalized = normalizeUsername(username);
  return `/fut_card_${normalized}.png`;
};

/**
 * Get default/fallback avatar URL
 * Used when user-specific card doesn't exist
 */
export const getDefaultAvatarUrl = (): string => {
  return '/fut_card_default.png';
};

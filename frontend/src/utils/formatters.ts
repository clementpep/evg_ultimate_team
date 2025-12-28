/**
 * Utility functions for formatting data.
 */

import { format, formatDistanceToNow } from 'date-fns';

/**
 * Format a date string to a readable format.
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy HH:mm');
  } catch {
    return dateString;
  }
};

/**
 * Format a date as relative time (e.g., "2 hours ago").
 */
export const formatRelativeTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return dateString;
  }
};

/**
 * Format points with sign (+/-).
 */
export const formatPoints = (points: number): string => {
  const sign = points >= 0 ? '+' : '';
  return `${sign}${points}`;
};

/**
 * Format rank with ordinal suffix (1st, 2nd, 3rd, etc.).
 */
export const formatRank = (rank: number): string => {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = rank % 100;
  return rank + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
};

/**
 * Truncate text to a maximum length.
 */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

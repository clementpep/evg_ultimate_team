/**
 * useFirstLogin Hook - Detect first-time login
 *
 * Uses localStorage to track whether user has seen the card reveal animation
 * Key: evg_has_seen_card_reveal_{userId}
 */

import { useState, useEffect, useCallback } from 'react';

interface UseFirstLoginReturn {
  shouldShowReveal: boolean;
  markAsRevealed: () => void;
}

export const useFirstLogin = (userId: number | undefined): UseFirstLoginReturn => {
  const [shouldShowReveal, setShouldShowReveal] = useState<boolean>(false);

  useEffect(() => {
    if (!userId) return;

    const storageKey = `evg_has_seen_card_reveal_${userId}`;
    const hasSeen = localStorage.getItem(storageKey);

    // If user has NOT seen the reveal, show it
    if (!hasSeen) {
      setShouldShowReveal(true);
    }
  }, [userId]);

  const markAsRevealed = useCallback(() => {
    if (!userId) return;

    const storageKey = `evg_has_seen_card_reveal_${userId}`;
    localStorage.setItem(storageKey, 'true');
    setShouldShowReveal(false);
  }, [userId]);

  return { shouldShowReveal, markAsRevealed };
};

/**
 * useSquadDiscovery Hook - Detect whether the groom has discovered the squad.
 *
 * Mirrors useFirstLogin but for Paul's "discover the team" pack experience.
 * Key: evg_has_discovered_squad_{userId}
 */

import { useState, useEffect, useCallback } from 'react';

interface UseSquadDiscoveryReturn {
  shouldShowDiscovery: boolean;
  markDiscovered: () => void;
}

export const useSquadDiscovery = (userId: number | undefined): UseSquadDiscoveryReturn => {
  const [shouldShowDiscovery, setShouldShowDiscovery] = useState<boolean>(false);

  useEffect(() => {
    if (!userId) return;

    const storageKey = `evg_has_discovered_squad_${userId}`;
    if (!localStorage.getItem(storageKey)) {
      setShouldShowDiscovery(true);
    }
  }, [userId]);

  const markDiscovered = useCallback(() => {
    if (!userId) return;
    localStorage.setItem(`evg_has_discovered_squad_${userId}`, 'true');
    setShouldShowDiscovery(false);
  }, [userId]);

  return { shouldShowDiscovery, markDiscovered };
};

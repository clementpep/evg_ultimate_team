/**
 * Custom hook for leaderboard data.
 */

import { useState, useEffect } from 'react';
import { ParticipantWithRank } from '@types/participant';
import * as leaderboardService from '@services/leaderboardService';

export const useLeaderboard = (includeToday = false, autoRefresh = false) => {
  const [leaderboard, setLeaderboard] = useState<ParticipantWithRank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      const data = await leaderboardService.getLeaderboard(includeToday);
      setLeaderboard(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    // Auto-refresh every 10 seconds if enabled
    if (autoRefresh) {
      const interval = setInterval(fetchLeaderboard, 10000);
      return () => clearInterval(interval);
    }
  }, [includeToday, autoRefresh]);

  return { leaderboard, isLoading, error, refetch: fetchLeaderboard };
};

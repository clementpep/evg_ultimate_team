/**
 * Custom hook for challenges data.
 */

import { useState, useEffect } from 'react';
import { Challenge } from '@types/challenge';
import * as challengeService from '@services/challengeService';

export const useChallenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChallenges = async () => {
    try {
      setIsLoading(true);
      const data = await challengeService.getAllChallenges();
      setChallenges(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch challenges');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  return { challenges, isLoading, error, refetch: fetchChallenges };
};

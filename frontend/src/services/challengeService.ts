/**
 * Challenge service for EVG Ultimate Team frontend.
 *
 * Handles all challenge-related API calls.
 */

import apiClient from './api';
import {
  Challenge,
  ChallengeCreate,
  ChallengeUpdate,
  ChallengeValidation,
} from '@types/challenge';
import { APIResponse } from '@types/api';

/**
 * Get all challenges.
 */
export const getAllChallenges = async (): Promise<Challenge[]> => {
  const response = await apiClient.get<APIResponse<Challenge[]>>('/challenges');
  return response.data.data || [];
};

/**
 * Get a specific challenge by ID.
 */
export const getChallengeById = async (id: number): Promise<Challenge> => {
  const response = await apiClient.get<APIResponse<Challenge>>(`/challenges/${id}`);

  if (response.data.data) {
    return response.data.data;
  }

  throw new Error('Challenge not found');
};

/**
 * Get challenges for a specific participant.
 */
export const getParticipantChallenges = async (
  participantId: number
): Promise<{ assigned: Challenge[]; completed: Challenge[] }> => {
  const response = await apiClient.get<
    APIResponse<{ assigned: Challenge[]; completed: Challenge[] }>
  >(`/challenges/participant/${participantId}`);

  return response.data.data || { assigned: [], completed: [] };
};

/**
 * Create a new challenge (admin only).
 */
export const createChallenge = async (data: ChallengeCreate): Promise<Challenge> => {
  const response = await apiClient.post<APIResponse<Challenge>>('/challenges', data);

  if (response.data.data) {
    return response.data.data;
  }

  throw new Error('Failed to create challenge');
};

/**
 * Update a challenge (admin only).
 */
export const updateChallenge = async (
  id: number,
  data: ChallengeUpdate
): Promise<Challenge> => {
  const response = await apiClient.put<APIResponse<Challenge>>(`/challenges/${id}`, data);

  if (response.data.data) {
    return response.data.data;
  }

  throw new Error('Failed to update challenge');
};

/**
 * Delete a challenge (admin only).
 */
export const deleteChallenge = async (id: number): Promise<void> => {
  await apiClient.delete(`/challenges/${id}`);
};

/**
 * Mark a challenge as being attempted.
 */
export const attemptChallenge = async (
  challengeId: number,
  participantId: number
): Promise<Challenge> => {
  const response = await apiClient.post<APIResponse<Challenge>>(
    `/challenges/${challengeId}/attempt`,
    { participant_id: participantId }
  );

  if (response.data.data) {
    return response.data.data;
  }

  throw new Error('Failed to mark challenge as active');
};

/**
 * Validate a challenge completion (admin only).
 */
export const validateChallenge = async (
  challengeId: number,
  validation: ChallengeValidation
): Promise<Challenge> => {
  const response = await apiClient.post<APIResponse<Challenge>>(
    `/challenges/${challengeId}/validate`,
    validation
  );

  if (response.data.data) {
    return response.data.data;
  }

  throw new Error('Failed to validate challenge');
};

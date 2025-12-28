/**
 * Participant service for EVG Ultimate Team frontend.
 *
 * Handles all participant-related API calls.
 */

import apiClient from './api';
import { Participant, ParticipantCreate, ParticipantUpdate } from '@types/participant';
import { APIResponse } from '@types/api';

/**
 * Get all participants.
 */
export const getAllParticipants = async (): Promise<Participant[]> => {
  const response = await apiClient.get<APIResponse<Participant[]>>('/participants');
  return response.data.data || [];
};

/**
 * Get a specific participant by ID.
 */
export const getParticipantById = async (id: number): Promise<Participant> => {
  const response = await apiClient.get<APIResponse<Participant>>(`/participants/${id}`);

  if (response.data.data) {
    return response.data.data;
  }

  throw new Error('Participant not found');
};

/**
 * Get current user's profile.
 */
export const getMyProfile = async (): Promise<Participant> => {
  const response = await apiClient.get<APIResponse<Participant>>('/participants/me/profile');

  if (response.data.data) {
    return response.data.data;
  }

  throw new Error('Failed to get profile');
};

/**
 * Create a new participant (admin only).
 */
export const createParticipant = async (data: ParticipantCreate): Promise<Participant> => {
  const response = await apiClient.post<APIResponse<Participant>>('/participants', data);

  if (response.data.data) {
    return response.data.data;
  }

  throw new Error('Failed to create participant');
};

/**
 * Update a participant (admin only).
 */
export const updateParticipant = async (
  id: number,
  data: ParticipantUpdate
): Promise<Participant> => {
  const response = await apiClient.put<APIResponse<Participant>>(`/participants/${id}`, data);

  if (response.data.data) {
    return response.data.data;
  }

  throw new Error('Failed to update participant');
};

/**
 * Delete a participant (admin only).
 */
export const deleteParticipant = async (id: number): Promise<void> => {
  await apiClient.delete(`/participants/${id}`);
};

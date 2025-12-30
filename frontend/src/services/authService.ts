/**
 * Authentication service for EVG Ultimate Team frontend.
 *
 * Handles login, logout, and token management.
 */

import apiClient from './api';
import { LoginRequest, AdminLoginRequest, AuthToken, CurrentUser } from '@/types/auth';
import { APIResponse } from '@/types/api';

/**
 * Login as a participant (username only).
 */
export const loginParticipant = async (username: string): Promise<AuthToken> => {
  const request: LoginRequest = { username };
  const response = await apiClient.post<APIResponse<AuthToken>>('/auth/login', request);

  if (response.data.success && response.data.data) {
    // Store token and user info in localStorage
    localStorage.setItem('auth_token', response.data.data.access_token);
    localStorage.setItem('current_user', JSON.stringify({
      id: response.data.data.user_id,
      username: response.data.data.username,
      is_admin: response.data.data.is_admin,
      is_groom: response.data.data.is_groom,
    }));

    return response.data.data;
  }

  throw new Error(response.data.error || 'Login failed');
};

/**
 * Login as admin (username + password).
 */
export const loginAdmin = async (username: string, password: string): Promise<AuthToken> => {
  const request: AdminLoginRequest = { username, password };
  const response = await apiClient.post<APIResponse<AuthToken>>('/auth/admin-login', request);

  if (response.data.success && response.data.data) {
    // Store token and user info in localStorage
    localStorage.setItem('auth_token', response.data.data.access_token);
    localStorage.setItem('current_user', JSON.stringify({
      id: response.data.data.user_id,
      username: response.data.data.username,
      is_admin: response.data.data.is_admin,
      is_groom: false,
    }));

    return response.data.data;
  }

  throw new Error(response.data.error || 'Admin login failed');
};

/**
 * Logout current user.
 */
export const logout = (): void => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('current_user');
};

/**
 * Get current user from localStorage.
 */
export const getCurrentUser = (): CurrentUser | null => {
  const userStr = localStorage.getItem('current_user');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

/**
 * Check if user is authenticated.
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('auth_token');
};

/**
 * Check if current user is admin.
 */
export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.is_admin || false;
};

/**
 * Get authentication token.
 */
export const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

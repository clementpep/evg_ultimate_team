/**
 * Authentication type definitions for EVG Ultimate Team frontend.
 */

export interface LoginRequest {
  username: string;
}

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  user_id: number | null;
  username: string;
  is_admin: boolean;
  is_groom: boolean;
}

export interface CurrentUser {
  id: number;
  username: string;
  is_admin: boolean;
  is_groom: boolean;
  total_points?: number;
}

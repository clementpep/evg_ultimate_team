/**
 * API response type definitions for EVG Ultimate Team frontend.
 */

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  detail?: string;
}

export interface PaginationParams {
  skip?: number;
  limit?: number;
}

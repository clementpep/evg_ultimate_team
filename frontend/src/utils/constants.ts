/**
 * Application constants.
 */

// PSG/FIFA Color Palette
export const COLORS = {
  psg: {
    blue: '#004170',
    red: '#DA291C',
    navy: '#001E41',
  },
  fifa: {
    gold: '#D4AF37',
    silver: '#C0C0C0',
    bronze: '#CD7F32',
    green: '#00FF41',
    dark: '#0A0A0A',
  },
};

// Challenge types
export const CHALLENGE_TYPES = {
  INDIVIDUAL: 'individual',
  TEAM: 'team',
  SECRET: 'secret',
} as const;

// Challenge statuses
export const CHALLENGE_STATUSES = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

// Pack tiers
export const PACK_TIERS = {
  BRONZE: { name: 'Bronze', cost: 100, color: COLORS.fifa.bronze },
  SILVER: { name: 'Silver', cost: 200, color: COLORS.fifa.silver },
  GOLD: { name: 'Gold', cost: 300, color: COLORS.fifa.gold },
  ULTIMATE: { name: 'Ultimate', cost: 500, color: COLORS.fifa.gold },
} as const;

// API endpoints (relative to base URL)
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    ADMIN_LOGIN: '/auth/admin-login',
  },
  PARTICIPANTS: '/participants',
  CHALLENGES: '/challenges',
  POINTS: '/points',
  LEADERBOARD: '/leaderboard',
} as const;

// WebSocket endpoints
export const WS_ENDPOINTS = {
  LEADERBOARD: '/ws/leaderboard',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  CURRENT_USER: 'current_user',
} as const;

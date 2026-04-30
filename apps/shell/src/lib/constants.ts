/** NestJS backend base URL (server-side only) */
export const API_BASE_URL = process.env.API_URL ?? 'http://localhost:3000';

/** Backend API paths (used by Next.js route handlers server-side) */
export const API_PATHS = {
  AUTH_LOGIN:      '/auth/login',
  AUTH_REGISTER:   '/auth/register',
  AUTH_REFRESH:    '/auth/refresh',
  AUTH_LOGOUT:     '/auth/logout',
  USERS_ME:        '/users/me',
  USERS_ME_AVATAR: '/users/me/avatar',
} as const;

/** Next.js BFF route paths (used by client-side pages) */
export const SHELL_API_PATHS = {
  AUTH_LOGIN:      '/api/auth/login',
  AUTH_REGISTER:   '/api/auth/register',
  AUTH_LOGOUT:     '/api/auth/logout',
  USERS_ME:        '/api/users/me',
  USERS_ME_AVATAR: '/api/users/me/avatar',
} as const;

export const COOKIE_NAMES = {
  ACCESS_TOKEN:  'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

/** Seconds — must match backend JWT config (15 min access, 7 day refresh) */
export const COOKIE_MAX_AGE = {
  ACCESS_TOKEN:  15 * 60,
  REFRESH_TOKEN: 7 * 24 * 60 * 60,
} as const;

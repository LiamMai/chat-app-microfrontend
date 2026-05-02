import type { AuthRouteResponse, UserRouteResponse } from './types';
import { ROUTES, SHELL_API_PATHS } from '@/lib/constants';

let inflightRefresh: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  if (!inflightRefresh) {
    inflightRefresh = fetch(SHELL_API_PATHS.AUTH_REFRESH, { method: 'POST' })
      .then((r) => r.ok)
      .catch(() => false)
      .finally(() => {
        // Clear on next tick so concurrent callers share the same flight.
        queueMicrotask(() => { inflightRefresh = null; });
      });
  }
  return inflightRefresh;
}

function redirectToLogin() {
  if (typeof window === 'undefined') return;
  const from = window.location.pathname + window.location.search;
  window.location.assign(`${ROUTES.LOGIN}?from=${encodeURIComponent(from)}`);
}

/**
 * Fetch wrapper for authenticated calls.
 * On 401: attempts a single refresh, then retries once.
 * If refresh fails, redirects to /login.
 */
async function authedFetch(input: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);
  if (res.status !== 401) return res;

  const refreshed = await refreshTokens();
  if (!refreshed) {
    redirectToLogin();
    return res;
  }
  return fetch(input, init);
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json() as Promise<T>;
}

async function authedPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await authedFetch(path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json() as Promise<T>;
}

async function authedUpload<T>(path: string, formData: FormData): Promise<T> {
  const res = await authedFetch(path, { method: 'PATCH', body: formData });
  return res.json() as Promise<T>;
}

export const authApi = {
  login: (email: string, password: string) =>
    post<AuthRouteResponse>(SHELL_API_PATHS.AUTH_LOGIN, { email, password }),

  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
  }) => post<AuthRouteResponse>(SHELL_API_PATHS.AUTH_REGISTER, data),

  refresh: () => post<AuthRouteResponse>(SHELL_API_PATHS.AUTH_REFRESH, {}),

  logout: () => post<AuthRouteResponse>(SHELL_API_PATHS.AUTH_LOGOUT, {}),
};

export const userApi = {
  updateProfile: (data: { firstName?: string; username?: string; bio?: string }) =>
    authedPatch<UserRouteResponse>(SHELL_API_PATHS.USERS_ME, data),

  updateAvatar: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return authedUpload<UserRouteResponse>(SHELL_API_PATHS.USERS_ME_AVATAR, fd);
  },
};

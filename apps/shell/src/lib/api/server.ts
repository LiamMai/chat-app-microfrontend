import type { ApiResponse, AuthData, UserProfile } from './types';
import { API_PATHS, API_BASE_URL } from '@/lib/constants';

async function post<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json() as Promise<ApiResponse<T>>;
}

async function patch<T>(path: string, body: unknown, token: string): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  return res.json() as Promise<ApiResponse<T>>;
}

export const authServerApi = {
  login: (email: string, password: string) =>
    post<AuthData>(API_PATHS.AUTH_LOGIN, { email, password }),

  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
  }) => post<AuthData>(API_PATHS.AUTH_REGISTER, data),

  refresh: (refreshToken: string) =>
    post<AuthData>(API_PATHS.AUTH_REFRESH, { refreshToken }),

  logout: () => post<void>(API_PATHS.AUTH_LOGOUT, {}),
};

export const userServerApi = {
  updateProfile: (token: string, data: {
    firstName?: string;
    username?: string;
    bio?: string;
  }) => patch<UserProfile>(API_PATHS.USERS_ME, data, token),
};

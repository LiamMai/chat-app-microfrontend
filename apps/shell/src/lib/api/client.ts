import type { AuthRouteResponse, UserRouteResponse } from './types';
import { SHELL_API_PATHS } from '@/lib/constants';

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json() as Promise<T>;
}

async function patch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json() as Promise<T>;
}

async function upload<T>(path: string, formData: FormData): Promise<T> {
  const res = await fetch(path, { method: 'PATCH', body: formData });
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

  logout: () => post<AuthRouteResponse>(SHELL_API_PATHS.AUTH_LOGOUT, {}),
};

export const userApi = {
  updateProfile: (data: { firstName?: string; username?: string; bio?: string }) =>
    patch<UserRouteResponse>(SHELL_API_PATHS.USERS_ME, data),

  updateAvatar: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return upload<UserRouteResponse>(SHELL_API_PATHS.USERS_ME_AVATAR, fd);
  },
};

import type { ApiEnvelope, ChatMessage, ChatRoom } from './types';

const SHELL_API = {
  AUTH_REFRESH: '/api/auth/refresh',
  ROOMS: '/api/chat/rooms',
  WS_TOKEN: '/api/auth/ws-token',
} as const;

const LOGIN_PATH = '/login';

let inflightRefresh: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  if (!inflightRefresh) {
    inflightRefresh = fetch(SHELL_API.AUTH_REFRESH, {
      method: 'POST',
      credentials: 'include',
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        queueMicrotask(() => {
          inflightRefresh = null;
        });
      });
  }

  return inflightRefresh;
}

function redirectToLogin() {
  if (typeof window === 'undefined') return;
  const from = window.location.pathname + window.location.search;
  window.location.assign(`${LOGIN_PATH}?from=${encodeURIComponent(from)}`);
}

async function authedFetch(path: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(path, {
    credentials: 'include',
    ...init,
  });

  if (response.status !== 401) {
    return response;
  }

  const refreshed = await refreshTokens();
  if (!refreshed) {
    redirectToLogin();
    return response;
  }

  return fetch(path, {
    credentials: 'include',
    ...init,
  });
}

async function get<T>(path: string, authed = false): Promise<T> {
  const res = authed
    ? await authedFetch(path)
    : await fetch(path, { credentials: 'include' });
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body: unknown, authed = false): Promise<T> {
  const init: RequestInit = {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
  const res = authed ? await authedFetch(path, init) : await fetch(path, init);
  if (!res.ok) throw new Error(`POST ${path} -> ${res.status}`);
  return res.json() as Promise<T>;
}

export const chatApi = {
  listRooms: (page = 1, limit = 20) =>
    get<ApiEnvelope<ChatRoom[]>>(
      `${SHELL_API.ROOMS}?page=${page}&limit=${limit}`,
      true,
    ),

  getMessages: (roomId: string, page = 1, limit = 50) =>
    get<ApiEnvelope<ChatMessage[]>>(
      `${SHELL_API.ROOMS}/${roomId}/messages?page=${page}&limit=${limit}`,
      true,
    ),

  sendMessage: (roomId: string, content: string) =>
    post<ApiEnvelope<ChatMessage>>(
      `${SHELL_API.ROOMS}/${roomId}/messages`,
      { content },
      true,
    ),

  fetchWsToken: () =>
    get<{ success: boolean; token: string; userId: string | null }>(SHELL_API.WS_TOKEN),
};

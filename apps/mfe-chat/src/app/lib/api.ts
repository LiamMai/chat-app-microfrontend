import type {
  ApiEnvelope,
  ChatMessage,
  ChatRoom,
  CurrentUser,
  IncomingFriendRequest,
} from './types';

const SHELL_API = {
  AUTH_REFRESH: '/api/auth/refresh',
  ROOMS: '/api/chat/rooms',
  WS_TOKEN: '/api/auth/ws-token',
  USERS_ME: '/api/users/me',
  FRIENDS_REQUESTS_IN: '/api/friends/requests/incoming',
} as const;

const LOGIN_PATH = '/login';

/** Append query params to a path using URLSearchParams (no manual concatenation). */
function withQuery(
  path: string,
  params: Record<string, string | number | undefined>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `${path}?${qs}` : path;
}

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

async function patch<T>(path: string, authed = false): Promise<T> {
  const init: RequestInit = { method: 'PATCH', credentials: 'include' };
  const res = authed ? await authedFetch(path, init) : await fetch(path, init);
  if (!res.ok) throw new Error(`PATCH ${path} -> ${res.status}`);
  return res.json() as Promise<T>;
}

export const chatApi = {
  listRooms: (page = 1, limit = 20) =>
    get<ApiEnvelope<ChatRoom[]>>(
      withQuery(SHELL_API.ROOMS, { page, limit }),
      true,
    ),

  getMessages: (roomId: string, page = 1, limit = 50) =>
    get<ApiEnvelope<ChatMessage[]>>(
      withQuery(`${SHELL_API.ROOMS}/${roomId}/messages`, { page, limit }),
      true,
    ),

  sendMessage: (roomId: string, content: string) =>
    post<ApiEnvelope<ChatMessage>>(
      `${SHELL_API.ROOMS}/${roomId}/messages`,
      { content },
      true,
    ),

  markRoomRead: (roomId: string) =>
    patch<ApiEnvelope<unknown>>(`${SHELL_API.ROOMS}/${roomId}/messages/read`, true),

  fetchWsToken: () =>
    get<{ success: boolean; token: string; userId: string | null }>(SHELL_API.WS_TOKEN),

  fetchMe: () =>
    get<{ success: boolean; user: CurrentUser | null }>(SHELL_API.USERS_ME, true),

  listIncomingRequests: (page = 1, limit = 20) =>
    get<ApiEnvelope<IncomingFriendRequest[]>>(
      withQuery(SHELL_API.FRIENDS_REQUESTS_IN, { page, limit }),
      true,
    ),

  acceptFriendRequest: (requesterId: string) =>
    patch<ApiEnvelope<unknown>>(`/api/friends/${requesterId}/accept`, true),

  declineFriendRequest: (requesterId: string) =>
    patch<ApiEnvelope<unknown>>(`/api/friends/${requesterId}/decline`, true),
};

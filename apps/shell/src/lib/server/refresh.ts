import { cookies } from 'next/headers';
import { COOKIE_NAMES } from '@/lib/constants';
import { authServerApi } from '@/lib/api/server';
import { setAuthCookies, clearAuthCookies } from './auth-cookies';

/**
 * Attempt to mint a fresh access token from the refresh_token cookie.
 * Side effect: rewrites both auth cookies on success, clears them on failure.
 */
export async function refreshAccessToken(): Promise<string | null> {
  const jar = await cookies();
  const refresh = jar.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;
  if (!refresh) return null;

  const res = await authServerApi.refresh(refresh);
  if (!res.success || !res.data) {
    await clearAuthCookies();
    return null;
  }
  await setAuthCookies(res.data.accessToken, res.data.refreshToken);
  return res.data.accessToken;
}

/**
 * Returns a usable access token — falls back to refresh flow if expired/missing.
 */
export async function getAccessTokenOrRefresh(): Promise<string | null> {
  const jar = await cookies();
  const access = jar.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;
  if (access) return access;
  return refreshAccessToken();
}

interface UpstreamResult<T> {
  status: number;
  json: T;
}

/**
 * Run a backend request with auto-refresh-on-401.
 * `fetcher` must return the raw Response so we can read status before parsing.
 */
export async function withAuth<T = unknown>(
  fetcher: (token: string) => Promise<Response>,
): Promise<UpstreamResult<T> | null> {
  let token = await getAccessTokenOrRefresh();
  if (!token) return null;

  let upstream = await fetcher(token);
  if (upstream.status === 401) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) return null;
    upstream = await fetcher(refreshed);
  }

  const json = (await upstream.json().catch(() => ({}))) as T;
  return { status: upstream.status, json };
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { clearAuthCookies } from '@/lib/server/authCookies';
import { authServerApi } from '@/lib/api/server';
import { COOKIE_NAMES } from '@/lib/constants';

export async function POST() {
  const jar = await cookies();
  const refreshToken = jar.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;

  // Best-effort backend revoke of the refresh token. Clearing the httpOnly
  // cookies is what actually ends the browser session, so we always do that
  // even if the backend call fails (e.g. token already expired).
  if (refreshToken) {
    try {
      await authServerApi.logout(refreshToken);
    } catch {
      /* ignore — proceed to clear cookies regardless */
    }
  }

  await clearAuthCookies();
  return NextResponse.json({ success: true });
}

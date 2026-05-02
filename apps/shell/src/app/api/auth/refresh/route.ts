import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAMES } from '@/lib/constants';
import { authServerApi } from '@/lib/api/server';
import { setAuthCookies, clearAuthCookies } from '@/lib/server/auth-cookies';

export async function POST() {
  try {
    const jar = await cookies();
    const refresh = jar.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;

    if (!refresh) {
      return NextResponse.json(
        { success: false, message: 'No refresh token' },
        { status: 401 },
      );
    }

    const json = await authServerApi.refresh(refresh);

    if (!json.success || !json.data) {
      await clearAuthCookies();
      return NextResponse.json(
        { success: false, message: json.message ?? 'Refresh failed' },
        { status: 401 },
      );
    }

    await setAuthCookies(json.data.accessToken, json.data.refreshToken);
    return NextResponse.json({ success: true, user: json.data.user });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Network error. Please try again.' },
      { status: 500 },
    );
  }
}

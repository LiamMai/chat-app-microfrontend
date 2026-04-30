import { NextRequest, NextResponse } from 'next/server';
import { setAuthCookies } from '@/lib/server/auth-cookies';
import { authServerApi } from '@/lib/api/server';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const json = await authServerApi.login(email, password);

    if (!json.success || !json.data) {
      return NextResponse.json(
        { success: false, message: json.message ?? 'Login failed' },
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

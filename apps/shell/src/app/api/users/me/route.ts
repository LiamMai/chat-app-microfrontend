import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAMES } from '@/lib/constants';
import { userServerApi } from '@/lib/api/server';

export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const json = await userServerApi.updateProfile(token, body);

    if (!json.success) {
      return NextResponse.json(
        { success: false, message: json.message ?? 'Profile update failed' },
        { status: 400 },
      );
    }
    return NextResponse.json({ success: true, user: json.data });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Network error. Please try again.' },
      { status: 500 },
    );
  }
}

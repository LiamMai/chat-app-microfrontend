import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAMES, API_BASE_URL, API_PATHS } from '@/lib/constants';

export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const upstream = await fetch(`${API_BASE_URL}${API_PATHS.USERS_ME_AVATAR}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const json = await upstream.json();

    if (!json.success) {
      return NextResponse.json(
        { success: false, message: json.message ?? 'Avatar upload failed' },
        { status: upstream.status },
      );
    }
    return NextResponse.json({ success: true, avatarUrl: json.data?.avatarUrl });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Network error. Please try again.' },
      { status: 500 },
    );
  }
}

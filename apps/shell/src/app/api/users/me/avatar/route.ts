import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, API_PATHS } from '@/lib/constants';
import { withAuth } from '@/lib/server/refresh';
import type { ApiResponse, UserProfile } from '@/lib/api/types';

export async function PATCH(req: NextRequest) {
  try {
    const formData = await req.formData();

    const result = await withAuth<ApiResponse<UserProfile>>((token) =>
      fetch(`${API_BASE_URL}${API_PATHS.USERS_ME_AVATAR}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }),
    );

    if (!result) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    if (!result.json.success) {
      return NextResponse.json(
        { success: false, message: result.json.message ?? 'Avatar upload failed' },
        { status: result.status || 400 },
      );
    }
    return NextResponse.json({ success: true, avatarUrl: result.json.data?.avatarUrl });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Network error. Please try again.' },
      { status: 500 },
    );
  }
}

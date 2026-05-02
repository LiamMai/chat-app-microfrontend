import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, API_PATHS } from '@/lib/constants';
import { withAuth } from '@/lib/server/refresh';
import type { ApiResponse, UserProfile } from '@/lib/api/types';

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    const result = await withAuth<ApiResponse<UserProfile>>((token) =>
      fetch(`${API_BASE_URL}${API_PATHS.USERS_ME}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }),
    );

    if (!result) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    if (!result.json.success) {
      return NextResponse.json(
        { success: false, message: result.json.message ?? 'Profile update failed' },
        { status: result.status || 400 },
      );
    }
    return NextResponse.json({ success: true, user: result.json.data });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Network error. Please try again.' },
      { status: 500 },
    );
  }
}

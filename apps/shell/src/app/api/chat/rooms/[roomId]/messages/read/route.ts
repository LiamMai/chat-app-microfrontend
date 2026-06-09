import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, API_PATHS } from '@/lib/constants';
import { withAuth } from '@/lib/server/refresh';
import type { ApiResponse } from '@/lib/api/types';

interface RouteContext {
  params: Promise<{ roomId: string }>;
}

// Mark all messages in :roomId as read for the current user.
export async function PATCH(_req: NextRequest, { params }: RouteContext) {
  const { roomId } = await params;

  const result = await withAuth<ApiResponse<unknown>>((token) =>
    fetch(`${API_BASE_URL}${API_PATHS.CHAT_ROOMS}/${roomId}/messages/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    }),
  );

  if (!result) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(result.json, { status: result.status });
}

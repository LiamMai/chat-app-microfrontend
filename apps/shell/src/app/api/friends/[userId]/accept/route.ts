import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/constants';
import { withAuth } from '@/lib/server/refresh';
import type { ApiResponse } from '@/lib/api/types';

interface RouteContext {
  params: Promise<{ userId: string }>;
}

// Accept the friend request from :userId (the requester).
export async function PATCH(_req: NextRequest, { params }: RouteContext) {
  const { userId } = await params;

  const result = await withAuth<ApiResponse<unknown>>((token) =>
    fetch(`${API_BASE_URL}/friends/${userId}/accept`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    }),
  );

  if (!result) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(result.json, { status: result.status });
}

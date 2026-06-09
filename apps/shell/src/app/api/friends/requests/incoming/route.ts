import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, API_PATHS } from '@/lib/constants';
import { withAuth } from '@/lib/server/refresh';
import type { ApiResponse } from '@/lib/api/types';

// Proxies the gateway's incoming friend-request list. Forwards pagination
// query params (page/limit) untouched.
export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.toString();
  const path = `${API_BASE_URL}${API_PATHS.FRIENDS_REQUESTS_IN}${search ? `?${search}` : ''}`;

  const result = await withAuth<ApiResponse<unknown>>((token) =>
    fetch(path, { headers: { Authorization: `Bearer ${token}` } }),
  );

  if (!result) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(result.json, { status: result.status });
}

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, API_PATHS } from '@/lib/constants';
import { withAuth } from '@/lib/server/refresh';
import type { ApiResponse } from '@/lib/api/types';
import type { ChatRoom } from '@/lib/api/chat-types';

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.toString();
  const path = `${API_BASE_URL}${API_PATHS.CHAT_ROOMS}${search ? `?${search}` : ''}`;

  const result = await withAuth<ApiResponse<ChatRoom[]>>((token) =>
    fetch(path, { headers: { Authorization: `Bearer ${token}` } }),
  );

  if (!result) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(result.json, { status: result.status });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await withAuth<ApiResponse<ChatRoom>>((token) =>
    fetch(`${API_BASE_URL}${API_PATHS.CHAT_ROOMS}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    }),
  );

  if (!result) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(result.json, { status: result.status });
}

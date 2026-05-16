import { NextResponse } from 'next/server';
import { getAccessTokenOrRefresh } from '@/lib/server/refresh';

interface JwtPayload {
  sub?: string;
  email?: string;
  exp?: number;
}

function decodeJwtPayload(token: string): JwtPayload | null {
  const part = token.split('.')[1];
  if (!part) return null;
  try {
    const padded = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(part.length + ((4 - (part.length % 4)) % 4), '=');
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf8')) as JwtPayload;
  } catch {
    return null;
  }
}

export async function GET() {
  const token = await getAccessTokenOrRefresh();
  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const payload = decodeJwtPayload(token);
  return NextResponse.json({
    success: true,
    token,
    userId: payload?.sub ?? null,
  });
}

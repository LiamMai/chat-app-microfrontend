import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAMES, ROUTES } from '@/lib/constants';

const PUBLIC_PATHS: ReadonlySet<string> = new Set([
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.ONBOARDING,
  '/forgot-password',
]);

const AUTH_ENTRY_PATHS: ReadonlySet<string> = new Set([
  ROUTES.LOGIN,
  ROUTES.REGISTER,
]);

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const access = req.cookies.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;
  const refresh = req.cookies.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;
  const isAuthed = !!access || !!refresh;
  const isPublic = PUBLIC_PATHS.has(pathname);

  if (!isAuthed && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = ROUTES.LOGIN;
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthed && AUTH_ENTRY_PATHS.has(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = ROUTES.MESSAGES;
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};

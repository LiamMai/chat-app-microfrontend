import { cookies } from 'next/headers';
import { COOKIE_NAMES, COOKIE_MAX_AGE } from '../constants';

const IS_PROD = process.env.NODE_ENV === 'production';

const BASE_OPTIONS = {
  httpOnly: true,
  secure:   IS_PROD,
  sameSite: 'lax',
  path:     '/',
} as const;

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const jar = await cookies();
  jar.set(COOKIE_NAMES.ACCESS_TOKEN,  accessToken,  { ...BASE_OPTIONS, maxAge: COOKIE_MAX_AGE.ACCESS_TOKEN });
  jar.set(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, { ...BASE_OPTIONS, maxAge: COOKIE_MAX_AGE.REFRESH_TOKEN });
}

export async function clearAuthCookies() {
  const jar = await cookies();
  jar.delete(COOKIE_NAMES.ACCESS_TOKEN);
  jar.delete(COOKIE_NAMES.REFRESH_TOKEN);
}

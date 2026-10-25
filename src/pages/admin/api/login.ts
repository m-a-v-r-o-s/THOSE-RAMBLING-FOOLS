import type { APIRoute } from 'astro';
import {
  SESSION_COOKIE, SESSION_MAX_AGE_S, clientIp, createSession, getAdminCredentials,
  loginWait, recordLoginFailure, recordLoginSuccess, safeEqual,
} from '@/lib/admin-auth';

export const prerender = false;

const DENIED = 'Wrong username or password.';

export const POST: APIRoute = async ({ request, cookies }) => {
  const creds = getAdminCredentials();
  if (!creds) {
    return Response.json({ error: 'Admin is not configured.' }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const username = typeof body?.username === 'string' ? body.username.trim() : '';
  const password = typeof body?.password === 'string' ? body.password.trim() : '';
  const ip = clientIp(request);

  const wait = loginWait(username, ip);
  if (wait > 0) {
    return Response.json({ error: DENIED }, {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil(wait / 1000)) },
    });
  }

  // Both compares always run (no short circuit) so timing reveals nothing.
  const okUser = safeEqual(username, creds.user);
  const okPass = safeEqual(password, creds.pass);
  if (!(okUser && okPass)) {
    recordLoginFailure(username, ip);
    return Response.json({ error: DENIED }, { status: 401 });
  }

  recordLoginSuccess(username, ip);
  cookies.set(SESSION_COOKIE, createSession(), {
    httpOnly: true,
    secure: !import.meta.env.DEV,
    sameSite: 'lax',
    path: '/admin',
    maxAge: SESSION_MAX_AGE_S,
  });
  return Response.json({ ok: true });
};

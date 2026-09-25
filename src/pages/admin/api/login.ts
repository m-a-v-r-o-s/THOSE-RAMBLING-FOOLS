import type { APIRoute } from 'astro';
import { SESSION_COOKIE, getAdminCredentials, sessionToken } from '@/lib/admin-auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const creds = getAdminCredentials();
  if (!creds) {
    return Response.json({ error: 'Admin is not configured.' }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const given = {
    username: typeof body?.username === 'string' ? body.username.trim() : '',
    password: typeof body?.password === 'string' ? body.password.trim() : '',
  };
  if (given.username !== creds.user || given.password !== creds.pass) {
    return Response.json({ error: 'Wrong username or password.' }, { status: 401 });
  }

  cookies.set(SESSION_COOKIE, await sessionToken(creds.user, creds.pass), {
    httpOnly: true,
    secure: !import.meta.env.DEV,
    sameSite: 'lax',
    path: '/admin',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return Response.json({ ok: true });
};

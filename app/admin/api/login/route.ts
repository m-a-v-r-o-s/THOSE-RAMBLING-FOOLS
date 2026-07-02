import { NextResponse } from 'next/server';
import { SESSION_COOKIE, getAdminCredentials, sessionToken } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const creds = getAdminCredentials();
  if (!creds) {
    return NextResponse.json({ error: 'Admin is not configured.' }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const given = {
    username: typeof body?.username === 'string' ? body.username.trim() : '',
    password: typeof body?.password === 'string' ? body.password.trim() : '',
  };
  if (given.username !== creds.user || given.password !== creds.pass) {
    return NextResponse.json({ error: 'Wrong username or password.' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await sessionToken(creds.user, creds.pass), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/admin',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}

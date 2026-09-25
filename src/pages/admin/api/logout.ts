import type { APIRoute } from 'astro';
import { SESSION_COOKIE } from '@/lib/admin-auth';

export const prerender = false;

export const POST: APIRoute = ({ cookies }) => {
  cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: !import.meta.env.DEV,
    sameSite: 'lax',
    path: '/admin',
    maxAge: 0,
  });
  return Response.json({ ok: true });
};

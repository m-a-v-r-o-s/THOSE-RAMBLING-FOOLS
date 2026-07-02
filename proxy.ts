import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, sessionToken } from '@/lib/admin-auth';

// Guards everything under /admin with a cookie session (set by /admin/login).
// Set ADMIN_USER and ADMIN_PASSWORD in the environment (Railway variables).

// Reachable without a session (otherwise you could never log in).
const PUBLIC_PATHS = ['/admin/login', '/admin/api/login'];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;

  // If credentials aren't configured, allow access in development so you're not
  // locked out locally, but refuse in production rather than exposing the panel.
  if (!user || !pass) {
    if (process.env.NODE_ENV !== 'production') return NextResponse.next();
    return new NextResponse('Admin is not configured.', { status: 503 });
  }

  const cookie = req.cookies.get(SESSION_COOKIE)?.value;
  const expected = await sessionToken(user, pass);
  if (cookie && cookie === expected) {
    return NextResponse.next();
  }

  // Not signed in: APIs get a clean 401 (so fetch() can handle it), page
  // requests are redirected to the styled login page.
  if (pathname.startsWith('/admin/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = '/admin/login';
  loginUrl.search = '';
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};

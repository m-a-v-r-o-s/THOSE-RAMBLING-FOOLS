import { NextResponse, type NextRequest } from 'next/server';

// Protects /admin (the panel + its API) with HTTP Basic auth.
// Set ADMIN_USER and ADMIN_PASSWORD in the environment (Railway variables).
export function proxy(req: NextRequest) {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;

  // If credentials aren't configured, allow access in development so you're not
  // locked out locally, but refuse in production rather than exposing the panel.
  if (!user || !pass) {
    if (process.env.NODE_ENV !== 'production') return NextResponse.next();
    return new NextResponse('Admin is not configured.', { status: 503 });
  }

  const header = req.headers.get('authorization');
  if (header?.startsWith('Basic ')) {
    const decoded = atob(header.slice(6));
    const sep = decoded.indexOf(':');
    const givenUser = decoded.slice(0, sep);
    const givenPass = decoded.slice(sep + 1);
    if (givenUser === user && givenPass === pass) {
      return NextResponse.next();
    }
  }

  return new NextResponse('Authentication required.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="TRF Admin", charset="UTF-8"' },
  });
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};

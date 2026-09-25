import { defineMiddleware } from 'astro:middleware';
import { SESSION_COOKIE, getAdminCredentials, sessionToken } from '@/lib/admin-auth';

// Guards everything under /admin with a cookie session (set by /admin/login).
// Set ADMIN_USER and ADMIN_PASSWORD in the environment (Railway variables).
// Only on-demand routes reach this; every /admin route is `prerender = false`.

// Reachable without a session (otherwise you could never log in).
const PUBLIC_PATHS = ['/admin/login', '/admin/api/login'];

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

// Browsers send Origin on every cross-site POST/PUT/DELETE. Compared by host
// only: TLS ends at Railway's proxy, so this app sees http for https requests.
function isCrossSiteWrite(request: Request, url: URL): boolean {
  if (SAFE_METHODS.includes(request.method)) return false;
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    return new URL(origin).host !== url.host;
  } catch {
    return true;
  }
}

export const onRequest = defineMiddleware(async (ctx, next) => {
  const { pathname } = ctx.url;
  if (pathname !== '/admin' && !pathname.startsWith('/admin/')) return next();

  if (isCrossSiteWrite(ctx.request, ctx.url)) {
    return new Response('Cross-site request blocked.', { status: 403 });
  }

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return next();
  }

  const creds = getAdminCredentials();

  // If credentials aren't configured, allow access in development so you're not
  // locked out locally, but refuse in production rather than exposing the panel.
  if (!creds) {
    if (import.meta.env.DEV) return next();
    return new Response('Admin is not configured.', { status: 503 });
  }

  const cookie = ctx.cookies.get(SESSION_COOKIE)?.value;
  if (cookie && cookie === (await sessionToken(creds.user, creds.pass))) {
    return next();
  }

  // Not signed in: APIs get a clean 401 (so fetch() can handle it), page
  // requests are redirected to the styled login page.
  if (pathname.startsWith('/admin/api/')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return ctx.redirect('/admin/login', 307);
});

// Production entry point (npm start). Wraps the Astro node adapter's standalone
// handler because the adapter serves prerendered pages and public/ files
// before Astro middleware runs, so headers and the apex redirect have to be
// applied here to reach every response.
import http from 'node:http';

process.env.ASTRO_NODE_AUTOSTART = 'disabled';
const { handler } = await import('./dist/server/entry.mjs');

const APEX = 'thoseramblingfools.com';
const CANONICAL_ORIGIN = 'https://www.thoseramblingfools.com';

const SECURITY_HEADERS = {
  // 'unsafe-inline' for scripts: Astro's island bootstrap and the view
  // transition router are inline scripts. Swap it for hashes (Astro's
  // security.csp) if that ever supports the ClientRouter.
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https://www.googletagmanager.com https://*.google-analytics.com",
    "media-src 'self'",
    "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; '),
  'Strict-Transport-Security': 'max-age=31536000',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
};

const NO_STORE = 'private, no-cache, no-store, max-age=0, must-revalidate';

function cacheControl(pathname) {
  // Album art and audio never change under the same filename (new art gets a
  // new name, e.g. album1new.webp), so Cloudflare can serve a plain HIT.
  // If a file IS ever replaced in place, rename it or purge the CF cache.
  if (pathname.startsWith('/covers/')) return 'public, max-age=31536000, immutable';
  // Read the JSON store on every request.
  if (pathname === '/our-story' || pathname === '/upcoming-gigs') return NO_STORE;
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return NO_STORE;
  // /_astro/* is content-hashed; the adapter marks it immutable itself.
  if (pathname.startsWith('/_astro/')) return null;
  // Prerendered HTML, robots.txt, sitemap.xml: always revalidate.
  return 'public, max-age=0, must-revalidate';
}

const server = http.createServer((req, res) => {
  const host = (req.headers.host || '').split(':')[0].toLowerCase();
  if (host === APEX) {
    res.writeHead(308, { Location: CANONICAL_ORIGIN + req.url });
    res.end();
    return;
  }

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) res.setHeader(key, value);
  const cc = cacheControl((req.url || '/').split('?')[0]);
  if (cc) res.setHeader('Cache-Control', cc);

  handler(req, res);
});

const port = Number(process.env.PORT) || 8080;
server.listen(port, '0.0.0.0', () => {
  console.log(`Listening on http://0.0.0.0:${port}`);
});

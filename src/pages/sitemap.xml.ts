import type { APIRoute } from 'astro';
import { SITE_URL } from '@/lib/site';

// Prerendered, so lastmod is the build time (same as the Next sitemap).
export const GET: APIRoute = () => {
  const lastmod = new Date().toISOString();
  const urls = ['', '/our-story', '/upcoming-gigs', '/privacy', '/terms']
    .map((route) => `<url>\n<loc>${SITE_URL}${route}</loc>\n<lastmod>${lastmod}</lastmod>\n</url>`)
    .join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml' } }
  );
};

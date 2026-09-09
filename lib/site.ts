// Public site URL, used for canonical/OG links, robots.txt and sitemap.xml.
// www is the canonical host: the apex redirects to it (see next.config.mjs), and
// it is the host registered in Google Search Console. NEXT_PUBLIC_SITE_URL can
// still override this for preview deployments.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.thoseramblingfools.com'
).replace(/\/$/, '');

export const SITE_NAME = 'Those Rambling Fools';

// Public site URL, used for canonical/OG links, robots.txt and sitemap.xml.
// www is the canonical host: the apex redirects to it (see server.mjs), and
// it is the host registered in Google Search Console. SITE_URL can still
// override this at build time for preview deployments.
export const SITE_URL = (
  process.env.SITE_URL || 'https://www.thoseramblingfools.com'
).replace(/\/$/, '');

export const SITE_NAME = 'Those Rambling Fools';

export const SITE_DESCRIPTION =
  'Original music from Those Rambling Fools, a band out of Kos, Greece. Play all five albums on the turntable, read the story behind them and find the next live gig.';

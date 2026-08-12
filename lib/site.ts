// Public site URL — used for canonical/OG links, robots.txt and sitemap.xml.
// NEEDS USER INPUT: set NEXT_PUBLIC_SITE_URL in production to the real domain.
// ".example" is a reserved placeholder TLD (RFC 2606) so this is never mistaken
// for a real, live address.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://thoseramblingfools.example'
).replace(/\/$/, '');

export const SITE_NAME = 'Those Rambling Fools';

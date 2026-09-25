import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';

// Static by default: every page is prerendered at build time except the ones
// that opt out with `export const prerender = false` (Our Story, Upcoming Gigs,
// admin pages and admin API), which read the JSON store on the Railway volume.
export default defineConfig({
  site: process.env.SITE_URL || 'https://www.thoseramblingfools.com',
  output: 'static',
  adapter: node({ mode: 'standalone', bodySizeLimit: 256 * 1024 }),
  integrations: [react()],
  // Next served /privacy, not /privacy/. Match it so canonicals and links stay put.
  trailingSlash: 'never',
  devToolbar: { enabled: false },
  // Astro's built-in origin check compares Origin against a URL whose scheme
  // comes from the socket. TLS ends at Railway's proxy, so the app sees http
  // while browsers send an https Origin, and every admin DELETE and logout
  // would get a 403. src/middleware.ts does the same check by host instead.
  security: { checkOrigin: false },
});

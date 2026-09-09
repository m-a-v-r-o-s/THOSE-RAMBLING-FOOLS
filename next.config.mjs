/** @type {import('next').NextConfig} */
const nextConfig = {
  // Apex and www both resolve to this app. Without a redirect Google treats
  // them as two competing sites for every page. www is canonical: it is the
  // host registered in Search Console and the one lib/site.ts emits.
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'thoseramblingfools.com' }],
        destination: 'https://www.thoseramblingfools.com/:path*',
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        // Album art and audio never change under the same filename (new art
        // gets a new name, e.g. album1new.webp). Without this Next sends
        // max-age=14400 + a weak etag, so Cloudflare revalidates against the
        // origin on every request instead of serving a plain HIT.
        // If a file IS ever replaced in place, rename it or purge the CF cache.
        source: '/covers/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;

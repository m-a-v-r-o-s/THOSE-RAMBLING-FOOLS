/** @type {import('next').NextConfig} */
const nextConfig = {
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

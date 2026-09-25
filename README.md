# Those Rambling Fools: Band Site

Astro site with a Node server (`@astrojs/node`, standalone), hosted on Railway.

## Running locally

Node 22.12+.

```bash
npm install
npm run dev        # http://localhost:3001
```

## Production build

```bash
npm run build
npm start          # node server.mjs, listens on 0.0.0.0:$PORT (default 8080)
```

## Structure

```
src/
  pages/            routes; our-story, upcoming-gigs and /admin render on demand,
                    everything else is prerendered at build time
  layouts/Base.astro  head metadata, JSON-LD, view-transition router, cookie banner
  components/       React islands (Turntable, AudioProvider store, StoryView,
                    mastheads, CookieBanner, admin editor + login)
  middleware.ts     /admin session guard
  styles/globals.css
  albums.ts         discography (turntable + JSON-LD)
lib/                data layer: gigs.json / posts.json in GIGS_DATA_DIR (Railway volume)
server.mjs          production entry: apex->www redirect, security and cache headers
public/covers/      art and album audio
```

Audio keeps playing across pages because navigation goes through Astro's
`<ClientRouter />` (no full reload) and the player state lives at module scope
in `src/components/AudioProvider.tsx`.

## Adding an album

Append an entry to `src/albums.ts`, drop the art and mp3 into `public/covers/`
under a new filename (covers are cached as immutable), and optionally add an
`[data-theme="album-N"]` block in `src/styles/globals.css`.

See `DEPLOY.md` for Railway notes.

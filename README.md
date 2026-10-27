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
  components/       React islands (PictureHouse home screen, Deck with the
                    drawn tonearm, TopBar, AudioProvider store, sfx, StoryView,
                    CookieBanner, admin editor + login)
  middleware.ts     /admin session guard
  styles/globals.css
  albums.ts         TRF albums and Mule singles (turntable + JSON-LD)
lib/                data layer: gigs.json / posts.json in GIGS_DATA_DIR (Railway volume)
server.mjs          production entry: apex->www redirect, security and cache headers
public/covers/      art and album audio
```

Audio keeps playing across pages because navigation goes through Astro's
`<ClientRouter />` (no full reload) and the player state lives at module scope
in `src/components/AudioProvider.tsx`.

## Adding a record

Append an entry to `ALBUMS` (TRF LP, 33⅓) or `SINGLES` (Mule 7-inch, 45) in
`src/albums.ts`. Drop the mp3, the full sleeve and a 320px square of it into
`public/covers/` under new filenames (covers are cached as immutable):

```bash
ffmpeg -i sleeve.webp -vf "scale=320:320:force_original_aspect_ratio=increase,crop=320:320" -c:v libwebp -quality 80 name-320.webp
```

`tint` is the colour the room takes while the record plays.

## Turntable

The tonearm is drawn in SVG over the deck photo (`src/components/Deck.tsx`),
pivoting on the photo's printed bearing. The needle angle for any groove radius
comes from the arm length and pivot-to-spindle distance, so it lands on the
lead-in and reaches the label. Button sounds are synthesized in
`src/components/sfx.ts`, no sample files.

See `DEPLOY.md` for Railway notes.

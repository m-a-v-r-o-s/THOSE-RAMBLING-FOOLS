# Those Rambling Fools — Band Site

A Next.js 15 site (App Router + TypeScript) with an interactive turntable that plays the band's albums via Spotify embeds. The site's color palette, background, and atmosphere shift to match whichever album is currently spinning.

## Running locally

You need **Node.js 18.18+** installed.

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Build for production

```bash
npm run build
npm start
```

## Project structure

```
those-rambling-fools-next/
├── app/
│   ├── components/
│   │   └── Turntable.tsx     ← interactive client component
│   ├── albums.ts             ← album data (covers, Spotify IDs)
│   ├── globals.css           ← theme system + all styling
│   ├── layout.tsx            ← root layout + Google Fonts
│   └── page.tsx              ← home page (server component)
├── public/
│   └── covers/               ← album cover images
├── package.json
├── tsconfig.json
└── next.config.mjs
```

## How it works

- `app/page.tsx` is a **server component** — it renders the static masthead/footer on the server with zero JS sent to the browser for that part.
- `app/components/Turntable.tsx` is a **client component** (`'use client'` directive) because it uses `useState`, `useRef`, and event handlers for the interactive turntable.
- `app/albums.ts` is the single source of truth for the discography. Add a new release by appending an entry there.
- The theme system uses CSS variables on `[data-theme="..."]` selectors. Clicking a vinyl sets `data-theme` on `<body>`, and all colors transition smoothly via CSS `transition`.

## Adding a new album

Edit `app/albums.ts`:

```ts
{
  key: 'album-5',  // must be unique
  name: 'V',
  title: 'New Album Name',
  cover: '/covers/album5.png',
  spotifyId: 'YOUR_SPOTIFY_ALBUM_ID',
}
```

Then drop `album5.png` into `public/covers/` and optionally add an `[data-theme="album-5"]` block in `globals.css` with custom colors. If you don't, it'll just use the default theme.

## Spotify embed notes

- The `/embed/album/...` iframe gives **30-second previews** to logged-out users and **full songs** to anyone logged into Spotify in the same browser.
- The play/pause/eject controls on the turntable are *visual* — Spotify's free embed doesn't expose play-state events to the page. Spotify's own play button inside the iframe controls actual audio playback.

## Deploying

The fastest path is [Vercel](https://vercel.com) (made by the Next.js team):

1. Push this folder to a GitHub repo
2. Import it on Vercel
3. It'll build and deploy automatically — no config needed

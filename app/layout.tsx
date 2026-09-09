import type { Metadata } from 'next';
import './globals.css';
import AudioProvider from './components/AudioProvider';
import CookieBanner from './components/CookieBanner';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import { ALBUMS } from './albums';

const DESCRIPTION =
  'Original music from Those Rambling Fools, a band out of Kos, Greece. Play all five albums on the turntable, read the story behind them and find the next live gig.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME}: Original Music from Kos, Greece`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  // Resolved per route against metadataBase, and inherited by pages that
  // define their own metadata. Apex and www both answer, so without this the
  // site competes with itself for every page.
  alternates: { canonical: './' },
  icons: { icon: '/covers/favicon.ico' },
  openGraph: {
    title: SITE_NAME,
    description: DESCRIPTION,
    url: '/',
    siteName: SITE_NAME,
    type: 'website',
    images: ['/covers/finafinallbg.webp'],
  },
};

// Band entity schema. Members and origin come from data/story.json and the gig
// listings, the profile links from the homepage footer, the discography from
// the same ALBUMS array the turntable renders.
const BAND_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'MusicGroup',
  '@id': `${SITE_URL}/#band`,
  name: SITE_NAME,
  url: SITE_URL,
  description: DESCRIPTION,
  image: `${SITE_URL}/covers/finafinallbg.webp`,
  logo: `${SITE_URL}/covers/newlogo.webp`,
  genre: 'Rock',
  foundingLocation: { '@type': 'Place', name: 'Kos, Greece' },
  areaServed: { '@type': 'Place', name: 'Kos, Greece' },
  member: [
    { '@type': 'Person', name: 'Christos P.' },
    { '@type': 'Person', name: 'Ioannis' },
  ],
  album: ALBUMS.map((a) => ({
    '@type': 'MusicAlbum',
    name: a.title,
    image: `${SITE_URL}${a.cover}`,
    byArtist: { '@id': `${SITE_URL}/#band` },
  })),
  sameAs: [
    'https://open.spotify.com/artist/04c4MB7bgg1DwEV7kLLJvf',
    'https://www.youtube.com/@ThoseRamblingFools',
    'https://www.instagram.com/thoseramblingfoolsofficial/',
    'https://www.deezer.com/en/artist/334497151',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Abel&display=swap"
          rel="stylesheet"
        />
        {/* Preload critical above-the-fold images */}
        <link rel="preload" as="image" href="/covers/newlogo.webp" />
        <link rel="preload" as="image" href="/covers/playeronlynew.webp" />
        <link
          rel="preload"
          as="image"
          href="/covers/finalfinalmob.webp"
          media="(max-width: 859px)"
        />
        <link
          rel="preload"
          as="image"
          href="/covers/finafinallbg.webp"
          media="(min-width: 860px)"
        />
      </head>
      <body data-theme="default">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(BAND_SCHEMA) }}
        />
        <AudioProvider>{children}</AudioProvider>
        <CookieBanner />
      </body>
    </html>
  );
}

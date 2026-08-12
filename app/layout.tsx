import type { Metadata } from 'next';
import './globals.css';
import AudioProvider from './components/AudioProvider';
import CookieBanner from './components/CookieBanner';
import { SITE_NAME, SITE_URL } from '@/lib/site';

const DESCRIPTION = 'Discography & turntable for the band Those Rambling Fools.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: DESCRIPTION,
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
        <AudioProvider>{children}</AudioProvider>
        <CookieBanner />
      </body>
    </html>
  );
}

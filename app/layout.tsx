import type { Metadata } from 'next';
import './globals.css';
import AudioProvider from './components/AudioProvider';

export const metadata: Metadata = {
  title: 'Those Rambling Fools',
  description: 'Discography & turntable for the band Those Rambling Fools.',
  icons: { icon: 'data:,' },
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
        <link rel="preload" as="image" href="/covers/trflogotext.webp" />
        <link rel="preload" as="image" href="/covers/playeronlynew.webp" />
        <link
          rel="preload"
          as="image"
          href="/covers/repmobile.webp"
          media="(max-width: 859px)"
        />
        <link
          rel="preload"
          as="image"
          href="/covers/rep.png"
          media="(min-width: 860px)"
        />
      </head>
      <body data-theme="default">
        <AudioProvider>{children}</AudioProvider>
      </body>
    </html>
  );
}

'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const CONSENT_KEY = 'trf-cookie-consent';
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

type Consent = 'accepted' | 'declined' | null;

// Simple, dependency-free cookie/analytics consent banner. Nothing is loaded
// (no analytics script) until the visitor accepts. Choice persists in
// localStorage so the banner only shows once.
export default function CookieBanner() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<Consent>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setConsent(window.localStorage.getItem(CONSENT_KEY) as Consent);
    setReady(true);
  }, []);

  function choose(value: 'accepted' | 'declined') {
    window.localStorage.setItem(CONSENT_KEY, value);
    setConsent(value);
  }

  // Internal admin tool — no need to show the public-facing notice there.
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <>
      {consent === 'accepted' && GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');`}
          </Script>
        </>
      )}

      {ready && consent === null && !isAdmin && (
        <div className="cookie-banner" role="dialog" aria-label="Cookie notice">
          <p className="cookie-banner-text">
            We use cookies for basic site functionality and, only with your consent, anonymous
            analytics. No personal data is sold or shared.{' '}
            <a href="/privacy" className="inquiries-link">
              Privacy Policy
            </a>
          </p>
          <div className="cookie-banner-actions">
            <button className="cookie-decline" onClick={() => choose('declined')}>
              Decline
            </button>
            <button className="cookie-accept" onClick={() => choose('accepted')}>
              Accept
            </button>
          </div>
        </div>
      )}
    </>
  );
}

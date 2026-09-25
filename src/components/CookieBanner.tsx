import { useEffect, useState } from 'react';

const CONSENT_KEY = 'trf-cookie-consent';
const GA_ID = import.meta.env.PUBLIC_GA_MEASUREMENT_ID as string | undefined;

type Consent = 'accepted' | 'declined' | null;

// Loads GA once per visit, and only after consent.
function loadAnalytics() {
  if (!GA_ID || document.getElementById('ga-src')) return;
  const src = document.createElement('script');
  src.id = 'ga-src';
  src.async = true;
  src.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(src);
  const w = window as unknown as { dataLayer: unknown[]; gtag: (...args: unknown[]) => void };
  w.dataLayer = w.dataLayer || [];
  w.gtag = function gtag() {
    // gtag.js expects the arguments object itself, not an array.
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer.push(arguments);
  };
  w.gtag('js', new Date());
  w.gtag('config', GA_ID);
}

// Simple, dependency-free cookie/analytics consent banner. Nothing is loaded
// (no analytics script) until the visitor accepts. Choice persists in
// localStorage so the banner only shows once. Not rendered on admin pages.
export default function CookieBanner() {
  const [consent, setConsent] = useState<Consent>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setConsent(window.localStorage.getItem(CONSENT_KEY) as Consent);
    setReady(true);
  }, []);

  useEffect(() => {
    if (consent === 'accepted') loadAnalytics();
  }, [consent]);

  function choose(value: 'accepted' | 'declined') {
    window.localStorage.setItem(CONSENT_KEY, value);
    setConsent(value);
  }

  if (!ready || consent !== null) return null;

  return (
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
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import SubpageMasthead from '../components/SubpageMasthead';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Those Rambling Fools collects, uses and protects visitor data on this site.',
  openGraph: {
    title: 'Privacy Policy | Those Rambling Fools',
    description: 'How Those Rambling Fools collects, uses and protects visitor data on this site.',
    url: '/privacy',
    siteName: 'Those Rambling Fools',
    type: 'website',
    images: ['/covers/finafinallbg.webp'],
  },
};

export default function PrivacyPolicy() {
  return (
    <div className="stage subpage">
      <SubpageMasthead />

      <main className="subpage-content">
        <h1 className="subpage-title">Privacy Policy</h1>

        <div className="legal-content">
          <p className="legal-updated">Last updated: 12 August 2026</p>

          <h2>Who we are</h2>
          <p>
            This site is built and run by Akos Digital Services on behalf of Those Rambling
            Fools, a band based in Kos, Greece. This policy explains what happens to your data
            when you visit thoseramblingfools&apos; website.
          </p>

          <h2>What we collect</h2>
          <p>
            This site does not have user accounts, does not process payments, and does not run a
            newsletter or mailing list. We do not knowingly collect personal information through
            the site itself. The only data that may be gathered is:
          </p>
          <ul>
            <li>
              Standard server logs (IP address, browser type, pages visited) generated
              automatically by our hosting provider for security and reliability purposes.
            </li>
            <li>
              Anonymous analytics — but only if you accept the cookie banner shown on your first
              visit. If you decline, no analytics cookies are set.
            </li>
          </ul>

          <h2>Cookies</h2>
          <p>
            We use a single functional flag to remember your cookie preference. If you accept
            analytics, an additional analytics cookie may be set to measure aggregate, anonymous
            traffic (e.g. which pages are visited). You can withdraw consent at any time by
            clearing your browser&apos;s local storage/cookies for this site.
          </p>

          <h2>Links to other sites</h2>
          <p>
            This site links out to Spotify, YouTube, Instagram and Deezer for music, video and
            booking inquiries. Once you leave our site for one of these platforms, their own
            privacy policies apply — we don&apos;t control and aren&apos;t responsible for how
            they handle your data.
          </p>

          <h2>Children&apos;s privacy</h2>
          <p>This site is not directed at children and we do not knowingly collect data from them.</p>

          <h2>Your rights</h2>
          <p>
            Since we don&apos;t hold accounts or personal profiles, there&apos;s generally nothing
            of yours for us to access, correct or delete beyond an anonymous analytics cookie you
            can clear yourself. If you believe we hold data about you and have a question, get in
            touch using the contact details below.
          </p>

          <h2>Contact</h2>
          <p>
            For privacy questions, email{' '}
            <a className="inquiries-link" href="mailto:info@akosds.com">
              info@akosds.com
            </a>
            . You can also reach the band via{' '}
            <a
              className="inquiries-link"
              href="https://www.instagram.com/thoseramblingfoolsofficial/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
            .
          </p>
        </div>

        <div className="subpage-links">
          <Link href="/" className="side-link">
            Back
          </Link>
          <Link href="/terms" className="side-link">
            Terms of Service
          </Link>
        </div>
      </main>
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import SubpageMasthead from '../components/SubpageMasthead';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms that apply to using the Those Rambling Fools website.',
  openGraph: {
    title: 'Terms of Service | Those Rambling Fools',
    description: 'The terms that apply to using the Those Rambling Fools website.',
    url: '/terms',
    siteName: 'Those Rambling Fools',
    type: 'website',
    images: ['/covers/finafinallbg.webp'],
  },
};

export default function TermsOfService() {
  return (
    <div className="stage subpage">
      <SubpageMasthead />

      <main className="subpage-content">
        <h1 className="subpage-title">Terms of Service</h1>

        <div className="legal-content">
          <p className="legal-updated">Last updated: 12 August 2026</p>

          <h2>Acceptance of terms</h2>
          <p>
            By using this site (the discography turntable, Our Story, Upcoming Gigs and related
            pages) you agree to these terms. If you don&apos;t agree, please don&apos;t use the
            site.
          </p>

          <h2>What this site is</h2>
          <p>
            This is the official website for the band Those Rambling Fools, built and run by Akos
            Digital Services: an interactive discography player, gig listings and stories from the
            band. It is not an e-commerce site — no purchases are made here, and any music,
            tickets or merchandise are handled entirely by the third-party platforms we link to
            (Spotify, YouTube, Instagram, Deezer).
          </p>

          <h2>Intellectual property</h2>
          <p>
            The music, artwork, band name, logo and written content on this site belong to Those
            Rambling Fools unless credited otherwise (for example, design elements credited to
            Concept Creative in the footer). You&apos;re welcome to link to this site or share
            pages, but please don&apos;t reproduce or redistribute the music or artwork without
            permission.
          </p>

          <h2>Acceptable use</h2>
          <p>
            Use this site lawfully and don&apos;t attempt to disrupt it (e.g. scraping the admin
            panel, attempting unauthorized access, or interfering with normal use by others).
          </p>

          <h2>Third-party links</h2>
          <p>
            Links to Spotify, YouTube, Instagram, Deezer and Google Maps take you to services we
            don&apos;t operate. Your use of those platforms is governed by their own terms, not
            ours.
          </p>

          <h2>No warranty</h2>
          <p>
            This site is provided &quot;as is&quot;. Gig dates and details are kept up to date on
            a best-effort basis but can change — always confirm directly with the venue before
            making plans. We don&apos;t guarantee uninterrupted or error-free availability of the
            site.
          </p>

          <h2>Limitation of liability</h2>
          <p>
            To the extent permitted by law, Akos Digital Services / Those Rambling Fools
            isn&apos;t liable for any indirect or consequential loss arising from your use of this
            site.
          </p>

          <h2>Governing law</h2>
          <p>These terms are governed by the laws of Greece, where the band is based.</p>

          <h2>Changes</h2>
          <p>
            We may update these terms as the site changes. Continued use of the site after an
            update means you accept the revised terms.
          </p>

          <h2>Contact</h2>
          <p>
            For questions about these terms, email{' '}
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
          <Link href="/privacy" className="side-link">
            Privacy Policy
          </Link>
        </div>
      </main>
    </div>
  );
}

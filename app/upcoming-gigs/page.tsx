import Link from 'next/link';

export default function UpcomingGigs() {
  return (
    <div className="stage subpage">
      <header className="masthead">
        <Link href="/" aria-label="Back to home">
          <img
            className="logo"
            src="/covers/trflogotext.webp"
            alt="Those Rambling Fools"
          />
        </Link>
      </header>

      <main className="subpage-content">
        <h1 className="subpage-title">Upcoming Gigs</h1>

        <div className="gig-entry">
          <p className="gig-name">Jacksons Bar</p>
          <p className="gig-details">Kos Town &mdash; Every Sunday at 9 pm</p>
          <a
            className="gig-map-link"
            href="https://maps.app.goo.gl/9JepgccwkysyrVfS8"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Google Maps
          </a>
        </div>

        <Link href="/" className="side-link">
          Back
        </Link>
      </main>
    </div>
  );
}

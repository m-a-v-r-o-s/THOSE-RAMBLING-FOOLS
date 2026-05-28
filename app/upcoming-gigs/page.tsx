import Link from 'next/link';

export default function UpcomingGigs() {
  return (
    <div className="stage subpage">
      <header className="masthead">
        <Link href="/" aria-label="Back to home">
          <img
            className="logo"
            src="/covers/trflogotext.png"
            alt="Those Rambling Fools"
          />
        </Link>
      </header>

      <main className="subpage-content">
        <h1 className="subpage-title">Upcoming Gigs</h1>
        <p>
          Coming soon — no dates announced yet. Check back for our next shows.
        </p>
        <Link href="/" className="side-link">
          Back
        </Link>
      </main>
    </div>
  );
}

import Link from 'next/link';
import GigList from '../components/GigList';

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

        <GigList />

        <Link href="/" className="side-link">
          Back
        </Link>
      </main>
    </div>
  );
}

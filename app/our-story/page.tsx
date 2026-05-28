import Link from 'next/link';

export default function OurStory() {
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
        <h1 className="subpage-title">Our Story</h1>
        <p>
          Coming soon — the tale of Those Rambling Fools.
        </p>
        <Link href="/" className="side-link">
          Back
        </Link>
      </main>
    </div>
  );
}

import Link from 'next/link';

export default function OurStory() {
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
        <h1 className="subpage-title">Ramblings</h1>
        <p>
          &ldquo;There&rsquo;s a break in the scene<br />
          But my kitchen is clean<br />
          Wait till you&rsquo;ve seen<br />
          Just what I&rsquo;ve been cooking...&rdquo;
        </p>
        <p>
          And Mr. Strings (Ioannis) and I sure have been cooking.
        </p>
        <p>
          No teams, no backing... I built the studio (Dromiko Productions) myself, you see...
          Thankfully we&rsquo;ve been graced by a few other talents every here and there,
          every now and again and our tunes have come out better than we had hoped for.
        </p>
        <p>
          Now, watch as we keep playing and working.<br />
          Watch as we build Rome over night, just for fun.
        </p>
        <p className="subpage-signature">&mdash;Christos P.</p>
        <Link href="/" className="side-link">
          Back
        </Link>
      </main>
    </div>
  );
}

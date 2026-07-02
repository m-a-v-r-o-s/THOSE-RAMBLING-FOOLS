import Link from 'next/link';
import { Fragment } from 'react';
import { getStory } from '@/lib/story';

// Always read the latest text at request time.
export const dynamic = 'force-dynamic';

// Blank line -> new paragraph. Single line break -> <br /> within a paragraph.
function renderBody(body: string) {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((paragraph, i) => (
      <p key={i}>
        {paragraph.split('\n').map((line, j, lines) => (
          <Fragment key={j}>
            {line}
            {j < lines.length - 1 && <br />}
          </Fragment>
        ))}
      </p>
    ));
}

export default async function OurStory() {
  const story = await getStory();

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
        <h1 className="subpage-title">{story.title}</h1>
        {renderBody(story.body)}
        {story.signature && <p className="subpage-signature">{story.signature}</p>}
        <Link href="/" className="side-link">
          Back
        </Link>
      </main>
    </div>
  );
}

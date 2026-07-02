'use client';

import { Fragment, useState } from 'react';
import type { Post } from '@/lib/posts';

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

export default function StoryView({ posts }: { posts: Post[] }) {
  const [activeId, setActiveId] = useState(posts[0]?.id);

  if (posts.length === 0) return null;

  // Single post: render exactly like the old static Ramblings page, no tabs.
  if (posts.length === 1) {
    const post = posts[0];
    return (
      <>
        <h1 className="subpage-title">{post.title}</h1>
        {renderBody(post.body)}
        {post.signature && <p className="subpage-signature">{post.signature}</p>}
      </>
    );
  }

  const active = posts.find((p) => p.id === activeId) ?? posts[0];

  return (
    <div className="story-blog">
      <nav className="story-tabs" aria-label="Posts">
        {posts.map((post) => (
          <button
            key={post.id}
            className={`story-tab${post.id === active.id ? ' active' : ''}`}
            onClick={() => setActiveId(post.id)}
          >
            {post.title}
          </button>
        ))}
      </nav>
      <div className="story-panel">
        <h1 className="subpage-title">{active.title}</h1>
        {renderBody(active.body)}
        {active.signature && <p className="subpage-signature">{active.signature}</p>}
      </div>
    </div>
  );
}

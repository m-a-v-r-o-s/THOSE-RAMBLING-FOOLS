'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

// Sticky logo for the Our Story / Upcoming Gigs pages — pins to the top once
// scrolled past, with a dark shadow fading in around it so content passing
// behind stays legible.
export default function SubpageMasthead() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} className="masthead-sentinel" aria-hidden="true" />
      <header className={`masthead${stuck ? ' stuck' : ''}`}>
        <Link href="/" aria-label="Back to home">
          <img
            className="logo"
            src="/covers/newlogo.webp"
            alt="Those Rambling Fools"
          />
        </Link>
      </header>
    </>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';

export default function Masthead() {
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
        <img
          className="logo"
          src="/covers/trflogotext.webp"
          alt="Those Rambling Fools"
          fetchPriority="high"
        />
      </header>
    </>
  );
}

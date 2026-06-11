'use client';

import { useEffect, useState } from 'react';

function VitaminBar() {
  return (
    <div className="gig-entry">
      <p className="gig-name">Vitamin Bar</p>
      <p className="gig-details">Kos Town &mdash; Wednesday 17/06 at about 9 pm</p>
      <a
        className="gig-map-link"
        href="https://maps.app.goo.gl/Bcd3G3hC7TbyzTxx9"
        target="_blank"
        rel="noopener noreferrer"
      >
        View on Google Maps
      </a>
    </div>
  );
}

function JacksonsBar() {
  return (
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
  );
}

export default function GigList() {
  // Compute after mount so the date reflects the visitor's "now"
  // (and SSR/first render stay identical to avoid hydration mismatch).
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  // Hide Vitamin Bar after 18/06; pull it to the top after 14/06.
  const showVitamin = !now || now < new Date(2026, 5, 18); // gone on 18/06+
  const vitaminTop = !!now && now >= new Date(2026, 5, 15); // top on 15/06+

  return (
    <>
      {showVitamin && vitaminTop && <VitaminBar />}
      <JacksonsBar />
      {showVitamin && !vitaminTop && <VitaminBar />}
    </>
  );
}

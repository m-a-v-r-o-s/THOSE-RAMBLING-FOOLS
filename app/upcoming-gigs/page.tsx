import Link from 'next/link';
import { getGigs } from '@/lib/gigs';
import { formatWhen } from '@/lib/gig-format';
import SubpageMasthead from '../components/SubpageMasthead';

// Always read the latest gigs at request time.
export const dynamic = 'force-dynamic';

export default async function UpcomingGigs() {
  const gigs = await getGigs();

  return (
    <div className="stage subpage">
      <SubpageMasthead />

      <main className="subpage-content">
        <h1 className="subpage-title">Upcoming Gigs</h1>

        {gigs.length === 0 ? (
          <p className="gig-details">No gigs scheduled right now — check back soon.</p>
        ) : (
          gigs.map((gig) => (
            <div className="gig-entry" key={gig.id}>
              <p className="gig-name">{gig.name}</p>
              <p className="gig-details">
                {[gig.location, formatWhen(gig)].filter(Boolean).join(' — ')}
              </p>
              {gig.mapUrl && (
                <a
                  className="gig-map-link"
                  href={gig.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Google Maps
                </a>
              )}
            </div>
          ))
        )}

        <Link href="/" className="side-link">
          Back
        </Link>
      </main>
    </div>
  );
}

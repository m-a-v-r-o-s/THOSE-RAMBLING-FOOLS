// Shared, dependency-free gig types + display formatting.
// Safe to import from both server components and client components
// (no `fs` here — that lives in ./gigs.ts).

export type Frequency = 'once' | 'weekly' | 'biweekly' | 'custom';

export interface Gig {
  id: string;
  name: string;
  location: string;
  mapUrl?: string;
  frequency: Frequency;
  weekday?: number; // 0 = Sunday … 6 = Saturday (weekly / biweekly)
  dates?: string[]; // 'YYYY-MM-DD' — one entry for 'once', many for 'custom'
  time?: string; // free text, e.g. "9 pm" or "about 9 pm"
  when?: string; // legacy free-text (records created before recurrence existed)
}

export type GigInput = Omit<Gig, 'id'>;

export const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const FREQUENCIES: Frequency[] = ['once', 'weekly', 'biweekly', 'custom'];

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  once: 'One-off date',
  weekly: 'Every week',
  biweekly: 'Every other week',
  custom: 'Custom dates',
};

// 'YYYY-MM-DD' → 'Wednesday 17/06'
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(y, m - 1, d);
  const dd = String(d).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  return `${WEEKDAYS[date.getDay()]} ${dd}/${mm}`;
}

// Human-readable "when" line for any gig.
export function formatWhen(gig: Gig): string {
  // Legacy records: free-text `when`, no structured recurrence.
  if (!gig.frequency && gig.when) return gig.when;

  const time = gig.time?.trim();
  const at = time ? ` at ${time}` : '';
  const weekday = WEEKDAYS[gig.weekday ?? 0];

  switch (gig.frequency) {
    case 'weekly':
      return `Every ${weekday}${at}`;
    case 'biweekly':
      return `Every other ${weekday}${at}`;
    case 'custom': {
      const dates = (gig.dates ?? []).filter(Boolean);
      return dates.length ? `${dates.map(formatDate).join(', ')}${at}` : time ?? '';
    }
    case 'once':
    default: {
      const first = (gig.dates ?? []).filter(Boolean)[0];
      return first ? `${formatDate(first)}${at}` : time ?? '';
    }
  }
}

// Removes gigs/dates that are in the past.
// - one-off: dropped once its date is before today (i.e. the day after the gig).
// - custom: past dates are removed; upcoming dates stay; the gig is dropped
//   entirely once every date has passed.
// - weekly / biweekly / legacy: never expire.
// `todayISO` is 'YYYY-MM-DD'; dates are compared as strings (ISO sorts correctly).
export function pruneGigs(
  gigs: Gig[],
  todayISO: string
): { gigs: Gig[]; changed: boolean } {
  let changed = false;
  const kept: Gig[] = [];

  for (const gig of gigs) {
    if (gig.frequency === 'once') {
      const date = (gig.dates ?? []).filter(Boolean)[0];
      if (date && date < todayISO) {
        changed = true; // past → drop
        continue;
      }
      kept.push(gig);
    } else if (gig.frequency === 'custom') {
      const all = (gig.dates ?? []).filter(Boolean);
      const upcoming = all.filter((d) => d >= todayISO);
      if (upcoming.length === 0) {
        changed = true; // all dates passed → drop the gig
        continue;
      }
      if (upcoming.length !== all.length) {
        changed = true; // some dates passed → keep gig with the rest
        kept.push({ ...gig, dates: upcoming });
      } else {
        kept.push(gig);
      }
    } else {
      kept.push(gig);
    }
  }

  return { gigs: kept, changed };
}

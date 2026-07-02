import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { pruneGigs, type Gig, type GigInput } from './gig-format';

export type { Gig, GigInput } from './gig-format';

// In production on Railway, set GIGS_DATA_DIR to a mounted Volume path (e.g. /data)
// so the file survives redeploys/restarts. Locally it falls back to ./data.
const DATA_DIR = process.env.GIGS_DATA_DIR || path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'gigs.json');

// Timezone used to decide when a gig has "passed" (the band is in Kos, Greece).
// Overridable via GIGS_TIMEZONE.
const TIMEZONE = process.env.GIGS_TIMEZONE || 'Europe/Athens';

function todayISO(): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE }).format(new Date());
}

// Seed used the first time the store is created.
const DEFAULT_GIGS: Gig[] = [
  {
    id: 'jacksons-bar',
    name: 'Jacksons Bar',
    location: 'Kos Town',
    frequency: 'weekly',
    weekday: 0, // Sunday
    time: '9 pm',
    mapUrl: 'https://maps.app.goo.gl/9JepgccwkysyrVfS8',
  },
  {
    id: 'vitamin-bar-17-06',
    name: 'Vitamin Bar',
    location: 'Kos Town',
    frequency: 'once',
    dates: ['2026-06-17'],
    time: 'about 9 pm',
    mapUrl: 'https://maps.app.goo.gl/Bcd3G3hC7TbyzTxx9',
  },
];

async function ensureFile(): Promise<void> {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(DEFAULT_GIGS, null, 2), 'utf8');
  }
}

export async function getGigs(): Promise<Gig[]> {
  await ensureFile();
  let gigs: Gig[];
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    gigs = Array.isArray(parsed) ? (parsed as Gig[]) : [];
  } catch {
    return [];
  }

  // Drop gigs/dates that have passed, persisting the cleanup when it changes.
  const { gigs: pruned, changed } = pruneGigs(gigs, todayISO());
  if (changed) {
    try {
      await saveGigs(pruned);
    } catch {
      // If the write fails we still return the pruned view for this request.
    }
  }
  return pruned;
}

async function saveGigs(gigs: Gig[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  // Write to a temp file then rename so a crash mid-write can't corrupt the store.
  const tmp = `${DATA_FILE}.${randomUUID()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(gigs, null, 2), 'utf8');
  await fs.rename(tmp, DATA_FILE);
}

export async function addGig(input: GigInput): Promise<Gig> {
  const gigs = await getGigs();
  const gig: Gig = { id: randomUUID(), ...input };
  gigs.push(gig);
  await saveGigs(gigs);
  return gig;
}

export async function deleteGig(id: string): Promise<boolean> {
  const gigs = await getGigs();
  const next = gigs.filter((g) => g.id !== id);
  if (next.length === gigs.length) return false;
  await saveGigs(next);
  return true;
}

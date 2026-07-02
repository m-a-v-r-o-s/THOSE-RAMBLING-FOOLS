import { NextResponse } from 'next/server';
import { getGigs, addGig } from '@/lib/gigs';
import { FREQUENCIES, type Frequency, type GigInput } from '@/lib/gig-format';

export const dynamic = 'force-dynamic';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET() {
  const gigs = await getGigs();
  return NextResponse.json(gigs);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.name !== 'string' || !body.name.trim()) {
    return NextResponse.json({ error: 'A name is required.' }, { status: 400 });
  }

  const frequency: Frequency = FREQUENCIES.includes(body.frequency)
    ? body.frequency
    : 'once';

  const validDates: string[] = Array.isArray(body.dates)
    ? body.dates.filter((d: unknown): d is string => typeof d === 'string' && DATE_RE.test(d))
    : [];

  const input: GigInput = {
    name: String(body.name).trim(),
    location: String(body.location ?? '').trim(),
    mapUrl: body.mapUrl ? String(body.mapUrl).trim() : undefined,
    time: body.time ? String(body.time).trim() : undefined,
    frequency,
  };

  if (frequency === 'weekly' || frequency === 'biweekly') {
    const wd = Number(body.weekday);
    input.weekday = Number.isInteger(wd) && wd >= 0 && wd <= 6 ? wd : 0;
  } else if (frequency === 'once') {
    if (validDates.length === 0) {
      return NextResponse.json({ error: 'A date is required.' }, { status: 400 });
    }
    input.dates = validDates.slice(0, 1);
  } else if (frequency === 'custom') {
    if (validDates.length === 0) {
      return NextResponse.json({ error: 'At least one date is required.' }, { status: 400 });
    }
    input.dates = validDates;
  }

  const gig = await addGig(input);
  return NextResponse.json(gig, { status: 201 });
}

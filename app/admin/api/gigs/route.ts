import { NextResponse } from 'next/server';
import { getGigs, addGig } from '@/lib/gigs';
import { parseGigInput } from '@/lib/gig-format';

export const dynamic = 'force-dynamic';

export async function GET() {
  const gigs = await getGigs();
  return NextResponse.json(gigs);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = parseGigInput(body);
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const gig = await addGig(parsed.input);
  return NextResponse.json(gig, { status: 201 });
}

import { NextResponse } from 'next/server';
import { deleteGig, updateGig } from '@/lib/gigs';
import { parseGigInput } from '@/lib/gig-format';

export const dynamic = 'force-dynamic';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = parseGigInput(body);
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const gig = await updateGig(id, parsed.input);
  if (!gig) {
    return NextResponse.json({ error: 'Gig not found.' }, { status: 404 });
  }
  return NextResponse.json(gig);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ok = await deleteGig(id);
  return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
}

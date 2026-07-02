import { NextResponse } from 'next/server';
import { deleteGig } from '@/lib/gigs';

export const dynamic = 'force-dynamic';

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ok = await deleteGig(id);
  return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
}

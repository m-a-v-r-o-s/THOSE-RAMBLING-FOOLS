import { NextResponse } from 'next/server';
import { reorderPosts } from '@/lib/posts';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request) {
  const body = await req.json().catch(() => null);
  const ids = body?.ids;
  if (!Array.isArray(ids) || !ids.every((id: unknown) => typeof id === 'string')) {
    return NextResponse.json({ error: 'Invalid order.' }, { status: 400 });
  }
  const reordered = await reorderPosts(ids);
  if (!reordered) {
    return NextResponse.json({ error: 'Order does not match current posts.' }, { status: 400 });
  }
  return NextResponse.json(reordered);
}

import { NextResponse } from 'next/server';
import { updatePost, deletePost, parsePostInput } from '@/lib/posts';

export const dynamic = 'force-dynamic';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = parsePostInput(body);
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const post = await updatePost(id, parsed.input);
  if (!post) {
    return NextResponse.json({ error: 'Post not found.' }, { status: 404 });
  }
  return NextResponse.json(post);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await deletePost(id);
  if (!result.ok) {
    const status = result.error === 'Post not found.' ? 404 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }
  return NextResponse.json({ ok: true });
}

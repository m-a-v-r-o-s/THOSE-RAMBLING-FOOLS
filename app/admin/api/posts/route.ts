import { NextResponse } from 'next/server';
import { getPosts, addPost, parsePostInput } from '@/lib/posts';

export const dynamic = 'force-dynamic';

export async function GET() {
  const posts = await getPosts();
  return NextResponse.json(posts);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = parsePostInput(body);
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const post = await addPost(parsed.input);
  return NextResponse.json(post, { status: 201 });
}

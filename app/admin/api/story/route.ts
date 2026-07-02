import { NextResponse } from 'next/server';
import { getStory, saveStory } from '@/lib/story';

export const dynamic = 'force-dynamic';

export async function GET() {
  const story = await getStory();
  return NextResponse.json(story);
}

export async function PUT(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.title !== 'string' || !body.title.trim()) {
    return NextResponse.json({ error: 'A title is required.' }, { status: 400 });
  }
  const saved = await saveStory({
    title: body.title.trim(),
    body: typeof body.body === 'string' ? body.body : '',
    signature: typeof body.signature === 'string' ? body.signature.trim() : '',
  });
  return NextResponse.json(saved);
}

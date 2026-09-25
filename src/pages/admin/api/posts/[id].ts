import type { APIRoute } from 'astro';
import { updatePost, deletePost, parsePostInput } from '@/lib/posts';

export const prerender = false;

export const PUT: APIRoute = async ({ params, request }) => {
  const body = await request.json().catch(() => null);
  const parsed = parsePostInput(body);
  if ('error' in parsed) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }
  const post = await updatePost(params.id!, parsed.input);
  if (!post) {
    return Response.json({ error: 'Post not found.' }, { status: 404 });
  }
  return Response.json(post);
};

export const DELETE: APIRoute = async ({ params }) => {
  const result = await deletePost(params.id!);
  if (!result.ok) {
    const status = result.error === 'Post not found.' ? 404 : 400;
    return Response.json({ error: result.error }, { status });
  }
  return Response.json({ ok: true });
};

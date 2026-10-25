import type { APIRoute } from 'astro';
import { requireAdmin } from '@/lib/admin-auth';
import { getPosts, addPost, parsePostInput } from '@/lib/posts';

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
  const denied = requireAdmin(cookies);
  if (denied) return denied;
  return Response.json(await getPosts());
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const denied = requireAdmin(cookies);
  if (denied) return denied;
  const body = await request.json().catch(() => null);
  const parsed = parsePostInput(body);
  if ('error' in parsed) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }
  const post = await addPost(parsed.input);
  return Response.json(post, { status: 201 });
};

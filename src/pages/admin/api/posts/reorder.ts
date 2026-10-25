import type { APIRoute } from 'astro';
import { requireAdmin } from '@/lib/admin-auth';
import { reorderPosts } from '@/lib/posts';

export const prerender = false;

export const PUT: APIRoute = async ({ request, cookies }) => {
  const denied = requireAdmin(cookies);
  if (denied) return denied;
  const body = await request.json().catch(() => null);
  const ids = body?.ids;
  if (!Array.isArray(ids) || !ids.every((id: unknown) => typeof id === 'string')) {
    return Response.json({ error: 'Invalid order.' }, { status: 400 });
  }
  const reordered = await reorderPosts(ids);
  if (!reordered) {
    return Response.json({ error: 'Order does not match current posts.' }, { status: 400 });
  }
  return Response.json(reordered);
};

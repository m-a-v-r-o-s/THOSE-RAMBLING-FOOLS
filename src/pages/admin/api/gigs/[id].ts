import type { APIRoute } from 'astro';
import { requireAdmin } from '@/lib/admin-auth';
import { deleteGig, updateGig } from '@/lib/gigs';
import { parseGigInput } from '@/lib/gig-format';

export const prerender = false;

export const PUT: APIRoute = async ({ params, request, cookies }) => {
  const denied = requireAdmin(cookies);
  if (denied) return denied;
  const body = await request.json().catch(() => null);
  const parsed = parseGigInput(body);
  if ('error' in parsed) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }
  const gig = await updateGig(params.id!, parsed.input);
  if (!gig) {
    return Response.json({ error: 'Gig not found.' }, { status: 404 });
  }
  return Response.json(gig);
};

export const DELETE: APIRoute = async ({ params, cookies }) => {
  const denied = requireAdmin(cookies);
  if (denied) return denied;
  const ok = await deleteGig(params.id!);
  return Response.json({ ok }, { status: ok ? 200 : 404 });
};

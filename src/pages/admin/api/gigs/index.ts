import type { APIRoute } from 'astro';
import { requireAdmin } from '@/lib/admin-auth';
import { getGigs, addGig } from '@/lib/gigs';
import { parseGigInput } from '@/lib/gig-format';

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
  const denied = requireAdmin(cookies);
  if (denied) return denied;
  return Response.json(await getGigs());
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const denied = requireAdmin(cookies);
  if (denied) return denied;
  const body = await request.json().catch(() => null);
  const parsed = parseGigInput(body);
  if ('error' in parsed) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }
  const gig = await addGig(parsed.input);
  return Response.json(gig, { status: 201 });
};

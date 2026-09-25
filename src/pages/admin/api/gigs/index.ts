import type { APIRoute } from 'astro';
import { getGigs, addGig } from '@/lib/gigs';
import { parseGigInput } from '@/lib/gig-format';

export const prerender = false;

export const GET: APIRoute = async () => Response.json(await getGigs());

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => null);
  const parsed = parseGigInput(body);
  if ('error' in parsed) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }
  const gig = await addGig(parsed.input);
  return Response.json(gig, { status: 201 });
};

// Shared admin-session helpers. No Node-only APIs (uses Web Crypto) so this can
// be imported from both the Edge middleware (proxy.ts) and Node route handlers.

export const SESSION_COOKIE = 'trf_admin';

// Reads the configured admin credentials, trimming surrounding whitespace
// (a common gotcha when pasting values into Railway/env vars). Returns null
// when either is unset.
export function getAdminCredentials(): { user: string; pass: string } | null {
  const user = process.env.ADMIN_USER?.trim();
  const pass = process.env.ADMIN_PASSWORD?.trim();
  if (!user || !pass) return null;
  return { user, pass };
}

// Opaque session token derived from the credentials. It never contains the
// password, and it changes if the password changes (invalidating old cookies).
// Knowing the token requires knowing user+password — at which point you could
// just log in normally — so no separate signing secret is needed.
export async function sessionToken(user: string, pass: string): Promise<string> {
  const data = new TextEncoder().encode(`${user}:${pass}:trf-admin-session-v1`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

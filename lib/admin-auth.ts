// Shared admin auth: credentials, login throttling, server-side sessions and the
// requireAdmin() guard. Runs on Node only (middleware and routes both execute in
// the single Node server), so node:crypto / node:net are fine here.
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { BlockList } from 'node:net';

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

// Constant time: hash both sides to equal-length digests first.
const digest = (s: string) => createHash('sha256').update(s).digest();
export function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(digest(a), digest(b));
}

// --- Client IP ---------------------------------------------------------------
// Railway's edge sets X-Real-IP to the connecting address. When that address is
// Cloudflare, the real visitor is in CF-Connecting-IP; otherwise trust X-Real-IP.
// X-Forwarded-For is never used (client-controlled).
// Cloudflare ranges from https://www.cloudflare.com/ips-v4 and /ips-v6, fetched 2026-10-25.
const CF = new BlockList();
for (const c of [
  '173.245.48.0/20', '103.21.244.0/22', '103.22.200.0/22', '103.31.4.0/22',
  '141.101.64.0/18', '108.162.192.0/18', '190.93.240.0/20', '188.114.96.0/20',
  '197.234.240.0/22', '198.41.128.0/17', '162.158.0.0/15', '104.16.0.0/13',
  '104.24.0.0/14', '172.64.0.0/13', '131.0.72.0/22',
]) { const [a, p] = c.split('/'); CF.addSubnet(a, +p, 'ipv4'); }
for (const c of [
  '2400:cb00::/32', '2606:4700::/32', '2803:f800::/32', '2405:b500::/32',
  '2405:8100::/32', '2a06:98c0::/29', '2c0f:f248::/32',
]) { const [a, p] = c.split('/'); CF.addSubnet(a, +p, 'ipv6'); }

export function clientIp(request: Request): string {
  const real = (request.headers.get('x-real-ip') ?? '').trim().replace(/^::ffff:/i, '');
  const fam = real.includes(':') ? 'ipv6' : 'ipv4';
  if (real && CF.check(real, fam)) {
    return request.headers.get('cf-connecting-ip')?.trim() || real;
  }
  return real || 'unknown';
}

// --- Login throttling --------------------------------------------------------
// Failures counted per account name and per IP; lockout doubles from 1s, max 15 min.
// ponytail: in-memory, single instance, a restart clears it; move to Supabase/Redis if scaled out.
const MAX_LOCK_MS = 15 * 60 * 1000;
const fails = new Map<string, { n: number; until: number; seen: number }>();

const keys = (user: string, ip: string) => [`u:${user.toLowerCase().slice(0, 100)}`, `i:${ip}`];

// Milliseconds the caller must still wait (0 = allowed).
export function loginWait(user: string, ip: string): number {
  const now = Date.now();
  return Math.max(0, ...keys(user, ip).map((k) => (fails.get(k)?.until ?? 0) - now));
}

export function recordLoginFailure(user: string, ip: string): void {
  const now = Date.now();
  if (fails.size > 5000) for (const [k, v] of fails) if (now - v.seen > MAX_LOCK_MS * 2) fails.delete(k);
  if (fails.size > 20000) fails.clear(); // hostile flood: fail open on memory, not on auth
  for (const k of keys(user, ip)) {
    const e = fails.get(k) ?? { n: 0, until: 0, seen: now };
    e.n += 1;
    e.until = now + Math.min(1000 * 2 ** (e.n - 1), MAX_LOCK_MS);
    e.seen = now;
    fails.set(k, e);
  }
}

export function recordLoginSuccess(user: string, ip: string): void {
  for (const k of keys(user, ip)) fails.delete(k);
}

// --- Sessions ----------------------------------------------------------------
// Random tokens held server-side; nothing derivable from the password. The store
// is per process, so a restart (e.g. after changing the env password) logs everyone out.
// ponytail: in-memory sessions, single instance; move to a table if scaled out.
const ABSOLUTE_MS = 12 * 60 * 60 * 1000;
const IDLE_MS = 2 * 60 * 60 * 1000;
export const SESSION_MAX_AGE_S = ABSOLUTE_MS / 1000;
const sessions = new Map<string, { created: number; last: number }>();

export function createSession(): string {
  const now = Date.now();
  for (const [t, s] of sessions) if (now - s.created > ABSOLUTE_MS || now - s.last > IDLE_MS) sessions.delete(t);
  const token = randomBytes(32).toString('hex');
  sessions.set(token, { created: now, last: now });
  return token;
}

export function destroySession(token: string | undefined): void {
  if (token) sessions.delete(token);
}

type CookieJar = { get(name: string): { value: string } | undefined };

export function isAdmin(cookies: CookieJar): boolean {
  // Mirrors the middleware: unconfigured creds open the panel in dev only.
  if (!getAdminCredentials()) return !!import.meta.env.DEV;
  const token = cookies.get(SESSION_COOKIE)?.value;
  const s = token ? sessions.get(token) : undefined;
  if (!token || !s) return false;
  const now = Date.now();
  if (now - s.created > ABSOLUTE_MS || now - s.last > IDLE_MS) {
    sessions.delete(token);
    return false;
  }
  s.last = now;
  return true;
}

// Defense in depth: call at the top of every admin handler/page, in addition to
// the middleware. Returns a 401 Response when not signed in, else null.
export function requireAdmin(cookies: CookieJar): Response | null {
  return isAdmin(cookies) ? null : Response.json({ error: 'Unauthorized' }, { status: 401 });
}

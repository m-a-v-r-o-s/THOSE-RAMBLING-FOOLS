import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export interface Post {
  id: string;
  title: string;
  // Raw text: a blank line starts a new paragraph, a single line break
  // becomes a <br /> within the same paragraph.
  body: string;
  signature: string;
  createdAt: string;
}

export type PostInput = Omit<Post, 'id' | 'createdAt'>;

// Shares the same data directory as gigs (the Railway Volume mounted at
// GIGS_DATA_DIR) — no extra env var needed. Locally this is ./data.
const DATA_DIR = process.env.GIGS_DATA_DIR || path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'posts.json');

const DEFAULT_POSTS: Post[] = [
  {
    id: 'ramblings-1',
    title: 'Ramblings',
    body: [
      '“There’s a break in the scene\nBut my kitchen is clean\nWait till you’ve seen\nJust what I’ve been cooking...”',
      'And Mr. Strings (Ioannis) and I sure have been cooking.',
      'No teams, no backing... I built the studio (Dromiko Productions) myself, you see... Thankfully we’ve been graced by a few other talents every here and there, every now and again and our tunes have come out better than we had hoped for.',
      'Now, watch as we keep playing and working.\nWatch as we build Rome over night, just for fun.',
    ].join('\n\n'),
    signature: '—Christos P.',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

async function ensureFile(): Promise<void> {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(DEFAULT_POSTS, null, 2), 'utf8');
  }
}

export async function getPosts(): Promise<Post[]> {
  await ensureFile();
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? (parsed as Post[]) : DEFAULT_POSTS;
  } catch {
    return DEFAULT_POSTS;
  }
}

async function savePosts(posts: Post[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${DATA_FILE}.${randomUUID()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(posts, null, 2), 'utf8');
  await fs.rename(tmp, DATA_FILE);
}

export function parsePostInput(body: any): { input: PostInput } | { error: string } {
  if (!body || typeof body.title !== 'string' || !body.title.trim()) {
    return { error: 'A title is required.' };
  }
  return {
    input: {
      title: String(body.title).trim(),
      body: typeof body.body === 'string' ? body.body : '',
      signature: typeof body.signature === 'string' ? body.signature.trim() : '',
    },
  };
}

// New posts default to the top of the list ("newest on top"); the admin can
// still drag any post to reorder afterwards.
export async function addPost(input: PostInput): Promise<Post> {
  const posts = await getPosts();
  const post: Post = { id: randomUUID(), createdAt: new Date().toISOString(), ...input };
  posts.unshift(post);
  await savePosts(posts);
  return post;
}

export async function updatePost(id: string, input: PostInput): Promise<Post | null> {
  const posts = await getPosts();
  const index = posts.findIndex((p) => p.id === id);
  if (index === -1) return null;
  const updated: Post = { ...posts[index], ...input };
  posts[index] = updated;
  await savePosts(posts);
  return updated;
}

// The site always needs at least one post to show on Our Story, so the last
// remaining post can't be deleted.
export async function deletePost(id: string): Promise<{ ok: boolean; error?: string }> {
  const posts = await getPosts();
  if (posts.length <= 1) {
    return { ok: false, error: 'Keep at least one post — delete or edit it instead.' };
  }
  const next = posts.filter((p) => p.id !== id);
  if (next.length === posts.length) {
    return { ok: false, error: 'Post not found.' };
  }
  await savePosts(next);
  return { ok: true };
}

// Reorders posts to match the given id order (used by the admin drag UI).
// Returns null if `ids` isn't an exact permutation of the current posts.
export async function reorderPosts(ids: string[]): Promise<Post[] | null> {
  const posts = await getPosts();
  if (ids.length !== posts.length) return null;
  const byId = new Map(posts.map((p) => [p.id, p]));
  const reordered: Post[] = [];
  for (const id of ids) {
    const post = byId.get(id);
    if (!post) return null;
    reordered.push(post);
  }
  await savePosts(reordered);
  return reordered;
}

import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export interface StoryContent {
  title: string;
  // Raw text: a blank line starts a new paragraph, a single line break
  // becomes a <br /> within the same paragraph.
  body: string;
  signature: string;
}

// Shares the same data directory as gigs (the Railway Volume mounted at
// GIGS_DATA_DIR) — no extra env var needed. Locally this is ./data.
const DATA_DIR = process.env.GIGS_DATA_DIR || path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'story.json');

const DEFAULT_STORY: StoryContent = {
  title: 'Ramblings',
  body: [
    '“There’s a break in the scene\nBut my kitchen is clean\nWait till you’ve seen\nJust what I’ve been cooking...”',
    'And Mr. Strings (Ioannis) and I sure have been cooking.',
    'No teams, no backing... I built the studio (Dromiko Productions) myself, you see... Thankfully we’ve been graced by a few other talents every here and there, every now and again and our tunes have come out better than we had hoped for.',
    'Now, watch as we keep playing and working.\nWatch as we build Rome over night, just for fun.',
  ].join('\n\n'),
  signature: '—Christos P.',
};

async function ensureFile(): Promise<void> {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(DEFAULT_STORY, null, 2), 'utf8');
  }
}

export async function getStory(): Promise<StoryContent> {
  await ensureFile();
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      title: typeof parsed.title === 'string' ? parsed.title : DEFAULT_STORY.title,
      body: typeof parsed.body === 'string' ? parsed.body : DEFAULT_STORY.body,
      signature:
        typeof parsed.signature === 'string' ? parsed.signature : DEFAULT_STORY.signature,
    };
  } catch {
    return DEFAULT_STORY;
  }
}

export async function saveStory(content: StoryContent): Promise<StoryContent> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${DATA_FILE}.${randomUUID()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(content, null, 2), 'utf8');
  await fs.rename(tmp, DATA_FILE);
  return content;
}

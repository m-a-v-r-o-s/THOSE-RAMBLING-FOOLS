import type { Metadata } from 'next';
import Link from 'next/link';
import { getPosts } from '@/lib/posts';
import StoryView from '../components/StoryView';
import SubpageMasthead from '../components/SubpageMasthead';

// Always read the latest posts at request time.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Our Story',
  description:
    "The story behind Those Rambling Fools, in the band's own words — how the music got made and what keeps it going.",
  openGraph: {
    title: 'Our Story | Those Rambling Fools',
    description:
      "The story behind Those Rambling Fools, in the band's own words.",
    url: '/our-story',
    siteName: 'Those Rambling Fools',
    type: 'website',
    images: ['/covers/ourstory.webp'],
  },
};

export default async function OurStory() {
  const posts = await getPosts();

  return (
    <div className="stage subpage">
      <SubpageMasthead />

      <main className="subpage-content">
        <StoryView posts={posts} />
        <div className="subpage-links">
          <Link href="/" className="side-link">
            Back
          </Link>
          <Link href="/upcoming-gigs" className="side-link">
            Upcoming Gigs
          </Link>
        </div>
      </main>
    </div>
  );
}

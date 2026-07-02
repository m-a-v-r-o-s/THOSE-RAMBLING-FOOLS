import Link from 'next/link';
import { getPosts } from '@/lib/posts';
import StoryView from '../components/StoryView';
import SubpageMasthead from '../components/SubpageMasthead';

// Always read the latest posts at request time.
export const dynamic = 'force-dynamic';

export default async function OurStory() {
  const posts = await getPosts();

  return (
    <div className="stage subpage">
      <SubpageMasthead />

      <main className="subpage-content">
        <StoryView posts={posts} />
        <Link href="/" className="side-link">
          Back
        </Link>
      </main>
    </div>
  );
}

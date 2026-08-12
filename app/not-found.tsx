import type { Metadata } from 'next';
import Link from 'next/link';
import SubpageMasthead from './components/SubpageMasthead';

export const metadata: Metadata = {
  title: 'Wrong Groove',
  description: "This page doesn't exist. Head back to the Those Rambling Fools turntable.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="stage subpage">
      <SubpageMasthead />

      <main className="subpage-content">
        <h1 className="subpage-title">Wrong Groove</h1>
        <p>
          This track isn&apos;t on the record. The page you&apos;re looking for has wandered off
          somewhere, same as the rest of us.
        </p>
        <Link href="/" className="side-link">
          Back to the turntable
        </Link>
      </main>
    </div>
  );
}

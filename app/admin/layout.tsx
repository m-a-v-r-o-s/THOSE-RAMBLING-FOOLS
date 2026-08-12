import type { Metadata } from 'next';

// Internal tool — never indexed, never in the sitemap.
export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from 'next'
import TopNav from '@/components/layout/TopNav'
import MobileNav from '@/components/layout/MobileNav'
import LibraryClient from '@/components/library/LibraryClient'

export const metadata: Metadata = {
  title: 'Library — YouTube Clone',
  description: 'Watch later, liked videos, and subscriptions (stored locally).',
}

export default function LibraryPage() {
  return (
    <div className="min-h-full bg-white dark:bg-black">
      <TopNav />
      <MobileNav />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <LibraryClient />
      </main>
    </div>
  )
}
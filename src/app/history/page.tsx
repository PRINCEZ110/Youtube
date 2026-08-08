import type { Metadata } from 'next'
import TopNav from '@/components/layout/TopNav'
import MobileNav from '@/components/layout/MobileNav'
import HistoryList from '@/components/history/HistoryList'

export const metadata: Metadata = {
  title: 'Watch history — YouTube Clone',
  description: 'Videos you recently watched (stored locally in your browser).',
}

export default function HistoryPage() {
  return (
    <div className="min-h-full bg-white dark:bg-black">
      <TopNav />
      <MobileNav />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <HistoryList />
      </main>
    </div>
  )
}
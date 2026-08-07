'use client'

import TopNav from '@/components/layout/TopNav'
import Sidebar from '@/components/layout/Sidebar'
import MobileNav from '@/components/layout/MobileNav'
import CategoryChips from '@/components/home/CategoryChips'
import VideoGrid from '@/components/video/VideoGrid'
import ContinueWatchingRow from '@/components/ui/ContinueWatchingRow'
import { useHistory } from '@/context/HistoryContext'
import { mockVideos } from '@/lib/data/mockVideos'

export default function Home() {
  const { history } = useHistory()

  const continueWatching = history
    .map((id) => mockVideos.find((v) => v.id === id))
    .filter((v) => v !== undefined)
    .slice(0, 10)

  return (
    <div className="min-h-full bg-white dark:bg-black">
      <TopNav />
      <MobileNav />
      <div className="flex">
        <Sidebar />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6">
          <CategoryChips />
          {continueWatching.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Continue watching
              </h2>
              <ContinueWatchingRow videos={continueWatching} />
            </div>
          )}
          <VideoGrid />
        </main>
      </div>
    </div>
  )
}

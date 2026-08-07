'use client'

import TopNav from '@/components/layout/TopNav'
import Sidebar from '@/components/layout/Sidebar'
import MobileNav from '@/components/layout/MobileNav'
import VideoCard from '@/components/video/VideoCard'
import { useHistory } from '@/context/HistoryContext'
import { mockVideos } from '@/lib/data/mockVideos'

export default function HistoryPage() {
  const { history, clearHistory } = useHistory()

  const videos = history
    .map((id) => mockVideos.find((v) => v.id === id))
    .filter((v) => v !== undefined)

  return (
    <div className="min-h-full bg-white dark:bg-black">
      <TopNav />
      <MobileNav />
      <div className="flex">
        <Sidebar />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              History
            </h1>
            {videos.length > 0 && (
              <button
                onClick={clearHistory}
                className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Clear history
              </button>
            )}
          </div>

          {videos.length === 0 ? (
            <p className="py-24 text-center text-zinc-500">No watch history yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

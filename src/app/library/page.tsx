'use client'

import TopNav from '@/components/layout/TopNav'
import Sidebar from '@/components/layout/Sidebar'
import MobileNav from '@/components/layout/MobileNav'
import VideoCard from '@/components/video/VideoCard'
import { useWatchLater } from '@/context/WatchLaterContext'
import { mockVideos } from '@/lib/data/mockVideos'

export default function LibraryPage() {
  const { saved } = useWatchLater()

  const videos = saved
    .map((id) => mockVideos.find((v) => v.id === id))
    .filter((v) => v !== undefined)

  return (
    <div className="min-h-full bg-white dark:bg-black">
      <TopNav />
      <MobileNav />
      <div className="flex">
        <Sidebar />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6">
          <h1 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Watch Later
            <span className="ml-2 text-sm font-normal text-zinc-500">
              {videos.length} {videos.length === 1 ? 'video' : 'videos'}
            </span>
          </h1>

          {videos.length === 0 ? (
            <p className="py-24 text-center text-zinc-500">
              No videos saved. Use the clock icon to save videos to Watch Later.
            </p>
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

'use client'

import TopNav from '@/components/layout/TopNav'
import Sidebar from '@/components/layout/Sidebar'
import MobileNav from '@/components/layout/MobileNav'
import VideoCard from '@/components/video/VideoCard'
import EmptyState from '@/components/ui/EmptyState'
import { Heart } from 'lucide-react'
import { mockVideos } from '@/lib/data/mockVideos'
import { useLiked } from '@/context/LikedContext'

export default function LikedPage() {
  const { liked } = useLiked()

  const videos = liked
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
            Liked videos
          </h1>

          {videos.length === 0 ? (
            <EmptyState message="No liked videos yet." icon={Heart} />
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

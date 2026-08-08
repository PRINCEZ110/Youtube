'use client'

import { useEffect, useState } from 'react'
import TopNav from '@/components/layout/TopNav'
import Sidebar from '@/components/layout/Sidebar'
import MobileNav from '@/components/layout/MobileNav'
import VideoCard from '@/components/video/VideoCard'
import VideoCardSkeleton from '@/components/ui/VideoCardSkeleton'
import FeedError from '@/components/ui/FeedError'
import EmptyState from '@/components/ui/EmptyState'
import { Heart } from 'lucide-react'
import { useLiked } from '@/context/LikedContext'
import type { ApiError, Video } from '@/lib/youtube/types'

export default function LikedPage() {
  const { liked } = useLiked()
  const [videos, setVideos] = useState<Video[] | null>(null)
  const [error, setError] = useState<ApiError | null>(null)

  useEffect(() => {
    if (liked.length === 0) {
      return
    }
    let cancelled = false
    fetch(`/api/youtube/videos?mode=details&ids=${liked.join(',')}`)
      .then((res) => res.json())
      .then((body) => {
        if (cancelled) return
        const payload = body as { ok: boolean; data?: Video[]; error?: ApiError }
        if (!payload.ok || !payload.data) {
          setError(payload.error ?? { kind: 'unknown', message: 'Could not load liked videos.', retryable: true })
          return
        }
        const byId = new Map(payload.data.map((v) => [v.id, v]))
        setVideos(liked.map((id) => byId.get(id)).filter((v): v is Video => v !== undefined))
        setError(null)
      })
      .catch(() => {
        if (!cancelled) {
          setError({ kind: 'network', message: 'Could not load liked videos.', retryable: true })
        }
      })
    return () => {
      cancelled = true
    }
  }, [liked])

  return (
    <div className="min-h-full bg-white dark:bg-black">
      <TopNav />
      <MobileNav />
      <div className="flex">
        <Sidebar />
        <main className="min-w-0 flex-1 px-4 py-4 sm:px-6">
          <h1 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Liked videos
          </h1>

          {liked.length === 0 && (
            <EmptyState message="No liked videos yet. Tap the heart on any video." icon={Heart} />
          )}

          {liked.length > 0 && videos === null && !error && (
            <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => (
                <VideoCardSkeleton key={i} />
              ))}
            </div>
          )}

          {error && videos === null && (
            <FeedError error={error} onRetry={() => setVideos(null)} />
          )}

          {videos !== null && videos.length === 0 && (
            <EmptyState message="No liked videos yet. Tap the heart on any video." icon={Heart} />
          )}

          {videos !== null && videos.length > 0 && (
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
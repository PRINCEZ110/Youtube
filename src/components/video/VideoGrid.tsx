'use client'

import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchVideos } from '@/store/slices/videoSlice'
import { mockVideos } from '@/lib/data/mockVideos'
import VideoCard from '@/components/video/VideoCard'
import VideoCardSkeleton from '@/components/video/VideoCardSkeleton'

export default function VideoGrid() {
  const dispatch = useAppDispatch()
  const { videos, loading, page } = useAppSelector((s) => s.videos)
  const selectedCategory = useAppSelector((s) => s.ui.selectedCategory)

  useEffect(() => {
    dispatch(fetchVideos(1))
  }, [dispatch])

  const categoryActive = selectedCategory !== null && selectedCategory !== 'all'
  const visible = categoryActive
    ? mockVideos.filter((v) => v.categoryId === selectedCategory)
    : videos

  if (loading && videos.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <VideoCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (visible.length === 0) {
    return (
      <p className="py-24 text-center text-zinc-500">
        No videos found in this category yet.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visible.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>

      {!categoryActive && videos.length < mockVideos.length && (
        <div className="flex justify-center">
          <button
            onClick={() => dispatch(fetchVideos(page + 1))}
            disabled={loading}
            className="rounded-full bg-zinc-100 px-6 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 disabled:opacity-50 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            {loading ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  )
}

'use client'

import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchFeed, fetchMoreFeed, resetFeed } from '@/store/slices/videoSlice'
import VideoCard from '@/components/video/VideoCard'
import SubscribedFeed from '@/components/video/SubscribedFeed'
import ShortsSection from '@/components/video/ShortsSection'
import FeedError from '@/components/ui/FeedError'
import VideoCardSkeleton from '@/components/ui/VideoCardSkeleton'
import { useFeedPrefs } from '@/context/FeedPrefsContext'
import type { LocalCategoryId } from '@/lib/youtube/types'
import { useInfiniteScroll } from '@/lib/hooks/useInfiniteScroll'

export default function VideoGrid() {
  const dispatch = useAppDispatch()
  const { videos, status, error, hasMore, loadingMore } = useAppSelector((s) => s.videos)
  const selectedCategory = useAppSelector((s) => s.ui.selectedCategory)
  const category = (selectedCategory ?? 'all') as LocalCategoryId
  const { videos: dismissedVideos, channels: dismissedChannels } = useFeedPrefs()

  const dismissedVideoSet = new Set(dismissedVideos)
  const dismissedChannelSet = new Set(dismissedChannels)
  const visibleVideos = videos.filter(
    (video) =>
      !dismissedVideoSet.has(video.id) && !dismissedChannelSet.has(video.channelId)
  )

  useEffect(() => {
    dispatch(resetFeed())
    dispatch(fetchFeed(category))
  }, [dispatch, category])

  const sentinelRef = useInfiniteScroll(() => {
    if (!loadingMore && hasMore && status === 'success') {
      dispatch(fetchMoreFeed())
    }
  }, { hasMore: hasMore && status === 'success', loading: loadingMore || status === 'loading' })

  if ((status === 'loading' || status === 'idle') && videos.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 12 }, (_, i) => (
          <VideoCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (status === 'error') {
    return (
      <FeedError
        error={error!}
        onRetry={() => dispatch(fetchFeed(category))}
      />
    )
  }

  if (status === 'success' && visibleVideos.length === 0) {
    return (
      <p className="py-24 text-center text-zinc-500 dark:text-zinc-400">
        No videos to show here. Try another category.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {category === 'all' && (
        <>
          <SubscribedFeed />
          <ShortsSection />
        </>
      )}
      <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {visibleVideos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>

      {hasMore && (
        <div ref={sentinelRef} className={`flex justify-center ${loadingMore ? '' : 'h-px'}`}>
          {loadingMore && (
            <div className="grid w-full grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {Array.from({ length: 4 }, (_, i) => (
                <VideoCardSkeleton key={i} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import VideoCard from '@/components/video/VideoCard'
import FeedError from '@/components/ui/FeedError'
import VideoCardSkeleton from '@/components/ui/VideoCardSkeleton'
import { useSubscriptions } from '@/context/SubscriptionsContext'
import { useFeedPrefs } from '@/context/FeedPrefsContext'
import type { ApiError, Video } from '@/lib/youtube/types'

const MAX_CHANNELS = 6
const PER_CHANNEL = 3

/** Latest videos from subscribed channels, shown at the top of the home feed. */
export default function SubscribedFeed() {
  const { subscriptions } = useSubscriptions()
  const { videos: dismissedVideos, channels: dismissedChannels } = useFeedPrefs()
  const [videos, setVideos] = useState<Video[]>([])
  const [error, setError] = useState<ApiError | null>(null)

  const visible = videos.filter(
    (video) =>
      !dismissedVideos.includes(video.id) && !dismissedChannels.includes(video.channelId)
  )
  const loading = subscriptions.length > 0 && videos.length === 0 && error === null

  useEffect(() => {
    if (subscriptions.length === 0) return
    let cancelled = false

    const load = async () => {
      try {
        const channels = subscriptions.slice(0, MAX_CHANNELS)
        const results = await Promise.all(
          channels.map(async (channelId) => {
            const res = await fetch(
              `/api/youtube/search?channelId=${encodeURIComponent(channelId)}&limit=${PER_CHANNEL}&order=date`
            )
            const body = (await res.json()) as {
              ok: boolean
              data?: { items: Video[] }
              error?: ApiError
            }
            return body.ok && body.data ? body.data.items : []
          })
        )
        if (cancelled) return
        const seen = new Set<string>()
        const merged: Video[] = []
        for (const items of results) {
          for (const video of items) {
            if (!seen.has(video.id)) {
              seen.add(video.id)
              merged.push(video)
            }
            if (merged.length >= 12) break
          }
          if (merged.length >= 12) break
        }
        setVideos(merged)
        setError(null)
      } catch {
        if (!cancelled)
          setError({ kind: 'network', message: 'Could not load your subscriptions.', retryable: true })
      }
    }
    void load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscriptions.join(',')])

  if (subscriptions.length === 0 || (visible.length === 0 && !loading && !error)) return null

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        From your subscriptions
      </h2>
      {error && <FeedError error={error} compact />}
      {loading && (
        <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      )}
      {!loading && visible.length > 0 && (
        <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {visible.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </section>
  )
}
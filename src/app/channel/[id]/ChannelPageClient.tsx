'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { BadgeCheck, Users } from 'lucide-react'
import ChannelAvatar from '@/components/ui/ChannelAvatar'
import FeedError from '@/components/ui/FeedError'
import VideoCard from '@/components/video/VideoCard'
import VideoCardSkeleton from '@/components/ui/VideoCardSkeleton'
import { useSubscriptions } from '@/context/SubscriptionsContext'
import { useInfiniteScroll } from '@/lib/hooks/useInfiniteScroll'
import { formatCompactNumber } from '@/lib/utils'
import type { ApiError, Channel, PageResponse, Video } from '@/lib/youtube/types'

type Order = 'date' | 'viewCount'

interface LoadedPage {
  videos: Video[]
  nextPageToken: string | null
}

export default function ChannelPageClient({
  channel,
  initialError,
}: {
  channel: Channel | null
  initialError: ApiError | null
}) {
  const { toggleSubscription, isSubscribed } = useSubscriptions()

  const [pages, setPages] = useState<Partial<Record<Order, LoadedPage>>>({})
  const [loadError, setLoadError] = useState<ApiError | null>(null)
  const [order, setOrder] = useState<Order>('date')

  const channelId = channel?.id ?? null
  const current = pages[order]

  const loadPage = useCallback(
    (pageToken?: string) => {
      if (!channelId) return Promise.resolve()
      const params = new URLSearchParams({ channelId, order, limit: '12' })
      if (pageToken) params.set('pageToken', pageToken)
      return fetch(`/api/youtube/search?${params}`)
        .then((res) => res.json())
        .then((body) => {
          const payload = body as {
            ok: boolean
            data?: PageResponse<Video>
            error?: ApiError
          }
          if (!payload.ok || !payload.data) {
            throw (
              payload.error ??
              ({ kind: 'unknown', message: 'Failed to load videos.', retryable: true } as ApiError)
            )
          }
          setPages((prev) => {
            const existing = prev[order]?.videos ?? []
            const seen = new Set(existing.map((v) => v.id))
            return {
              ...prev,
              [order]: {
                videos: pageToken
                  ? [...existing, ...payload.data!.items.filter((v) => !seen.has(v.id))]
                  : payload.data!.items,
                nextPageToken: payload.data!.nextPageToken,
              },
            }
          })
          setLoadError(null)
        })
        .catch((err) => {
          setLoadError(err as ApiError)
        })
    },
    [channelId, order]
  )

  useEffect(() => {
    if (!channelId || pages[order]) return
    void loadPage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId, order])

  const loading = !pages[order]
  const loadFailed = !!loadError && !current

  const sentinelRef = useInfiniteScroll(() => {
    if (current?.nextPageToken && !loadError) {
      void loadPage(current.nextPageToken)
    }
  }, { hasMore: !!current?.nextPageToken && !loadError, loading })

  if (!channel) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16">
        <FeedError
          error={
            initialError ?? { kind: 'not-found', message: 'This channel is unavailable.', retryable: false }
          }
        />
      </main>
    )
  }

  const subscribed = isSubscribed(channel.id)

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <header className="flex flex-col gap-4 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <div className="relative h-32 bg-zinc-200 sm:h-48 dark:bg-zinc-800">
          {channel.banner && (
            <Image src={channel.banner} alt="" fill sizes="1152px" className="object-cover" />
          )}
        </div>
        <div className="flex flex-col gap-4 px-4 pb-4 sm:flex-row sm:items-center sm:gap-6 sm:px-6">
          <div className="-mt-14 sm:-mt-16">
            <ChannelAvatar name={channel.name} avatarUrl={channel.avatar} size={96} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="flex items-center gap-2 text-xl font-bold text-zinc-900 sm:text-2xl dark:text-zinc-100">
              <span className="truncate">{channel.name}</span>
              {channel.verified && (
                <BadgeCheck size={22} className="shrink-0 fill-zinc-400 text-white dark:text-black" />
              )}
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
              <span className="flex items-center gap-1">
                <Users size={15} />
                {formatCompactNumber(channel.subscriberCount)} subscribers
              </span>
              {channel.videoCount > 0 && <span>{formatCompactNumber(channel.videoCount)} videos</span>}
              {channel.viewCount > 0 && (
                <span>{formatCompactNumber(channel.viewCount)} views</span>
              )}
            </p>
            {channel.description && (
              <p className="mt-2 line-clamp-2 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">
                {channel.description}
              </p>
            )}
          </div>
          <button
            onClick={() => toggleSubscription(channel.id)}
            aria-pressed={subscribed}
            className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
              subscribed
                ? 'bg-zinc-200 text-zinc-800 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700'
                : 'bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300'
            }`}
          >
            {subscribed ? 'Subscribed' : 'Subscribe'}
          </button>
        </div>
      </header>

      <div className="mt-6 flex items-center gap-2">
        {(
          [
            { id: 'date', label: 'Recent' },
            { id: 'viewCount', label: 'Most popular' },
          ] as { id: Order; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setOrder(tab.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              order === tab.id
                ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {loading && !loadError && (
          <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {Array.from({ length: 6 }, (_, i) => (
              <VideoCardSkeleton key={i} />
            ))}
          </div>
        )}

        {loadFailed && <FeedError error={loadError!} onRetry={() => void loadPage()} />}

        {current && current.videos.length === 0 && (
          <p className="py-16 text-center text-zinc-500 dark:text-zinc-400">
            No videos on this channel yet.
          </p>
        )}

        {current && current.videos.length > 0 && (
          <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {current.videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}

        {current?.nextPageToken && !loadError && <div ref={sentinelRef} className="h-px" />}
      </div>
    </main>
  )
}
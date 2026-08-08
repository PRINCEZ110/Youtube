'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sparkles, Trash2 } from 'lucide-react'
import { useCustomFeeds } from '@/context/CustomFeedsContext'
import VideoCard from '@/components/video/VideoCard'
import VideoCardSkeleton from '@/components/ui/VideoCardSkeleton'
import FeedError from '@/components/ui/FeedError'
import { useInfiniteScroll } from '@/lib/hooks/useInfiniteScroll'
import type { ApiError, PageResponse, Video } from '@/lib/youtube/types'

interface LoadedPage {
  videos: Video[]
  nextPageToken: string | null
}

export default function FeedClient({ id }: { id: string }) {
  const { feeds, removeFeed } = useCustomFeeds()
  const router = useRouter()
  const feed = feeds.find((f) => f.id === id)

  const [page, setPage] = useState<LoadedPage | null>(null)
  const [loadError, setLoadError] = useState<ApiError | null>(null)

  const loadPage = useCallback(
    (pageToken?: string) => {
      if (!feed) return Promise.resolve()
      const params = new URLSearchParams({ q: feed.query, order: 'date', limit: '12' })
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
              ({ kind: 'unknown', message: 'Failed to load this feed.', retryable: true } as ApiError)
            )
          }
          setPage((prev) => {
            const existing = prev?.videos ?? []
            const seen = new Set(existing.map((v) => v.id))
            return {
              videos: pageToken
                ? [...existing, ...payload.data!.items.filter((v) => !seen.has(v.id))]
                : payload.data!.items,
              nextPageToken: payload.data!.nextPageToken,
            }
          })
          setLoadError(null)
        })
        .catch((err) => {
          setLoadError(err as ApiError)
        })
    },
    [feed]
  )

  useEffect(() => {
    if (!feed || page) return
    void loadPage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feed, id])

  const sentinelRef = useInfiniteScroll(() => {
    if (page?.nextPageToken && !loadError) {
      void loadPage(page.nextPageToken)
    }
  }, { hasMore: !!page?.nextPageToken && !loadError, loading: !page })

  if (!feed) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <Sparkles size={40} className="text-zinc-400" />
        <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          This feed doesn&apos;t exist anymore
        </p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Create custom feeds from the home page chips.
        </p>
        <Link
          href="/"
          className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Back to Home
        </Link>
      </div>
    )
  }

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            <Sparkles size={22} className="shrink-0 text-violet-500" />
            <span className="truncate">{feed.name}</span>
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Latest videos about &quot;{feed.query}&quot;
          </p>
        </div>
        <button
          onClick={() => {
            removeFeed(feed.id)
            router.push('/')
          }}
          aria-label={`Delete "${feed.name}" feed`}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </header>

      {!page && !loadError && (
        <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      )}

      {loadError && !page && <FeedError error={loadError} onRetry={() => void loadPage()} />}

      {page && page.videos.length === 0 && (
        <p className="py-24 text-center text-zinc-500 dark:text-zinc-400">
          No recent videos for &quot;{feed.query}&quot; yet. Try again later.
        </p>
      )}

      {page && page.videos.length > 0 && (
        <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {page.videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}

      {page?.nextPageToken && !loadError && <div ref={sentinelRef} className="h-px" />}
    </div>
  )
}
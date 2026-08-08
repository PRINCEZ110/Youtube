'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { PlaySquare } from 'lucide-react'
import TopNav from '@/components/layout/TopNav'
import MobileNav from '@/components/layout/MobileNav'
import FeedError from '@/components/ui/FeedError'
import { formatViews } from '@/lib/utils'
import { useInfiniteScroll } from '@/lib/hooks/useInfiniteScroll'
import type { ApiError, PageResponse, Video } from '@/lib/youtube/types'

/** Vertical shorts browsing page — one 9:16 column of the latest viral shorts. */
export default function ShortsPage() {
  const [items, setItems] = useState<Video[]>([])
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)
  const [error, setError] = useState<ApiError | null>(null)
  const [loading, setLoading] = useState(false)

  const load = (pageToken?: string) => {
    const params = new URLSearchParams({ q: 'shorts', order: 'viewCount', limit: '20' })
    if (pageToken) params.set('pageToken', pageToken)
    return fetch(`/api/youtube/search?${params}`)
      .then((res) => res.json())
      .then((body) => {
        const payload = body as { ok: boolean; data?: PageResponse<Video>; error?: ApiError }
        if (!payload.ok || !payload.data) {
          throw (
            payload.error ??
            ({ kind: 'unknown', message: 'Could not load shorts.', retryable: true } as ApiError)
          )
        }
        setLoading(false)
        const existing = new Set(items.map((v) => v.id))
        setItems((prev) => [
          ...prev,
          ...payload.data!.items.filter((v) => !existing.has(v.id)),
        ])
        setNextPageToken(payload.data.nextPageToken)
        setError(null)
      })
      .catch((err) => {
        setLoading(false)
        setError(err as ApiError)
      })
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sentinelRef = useInfiniteScroll(() => {
    if (nextPageToken && !loading) {
      setLoading(true)
      void load(nextPageToken)
    }
  }, { hasMore: !!nextPageToken && !error, loading })

  return (
    <div className="min-h-full bg-white dark:bg-black">
      <TopNav />
      <MobileNav />
      <main className="flex flex-col items-center px-4 py-6 sm:px-6">
        <h1 className="mb-6 flex items-center gap-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          <PlaySquare size={24} className="text-red-600" />
          Shorts
        </h1>

        {error && items.length === 0 && (
          <FeedError error={error} onRetry={() => void load()} />
        )}

        <div className="grid w-full max-w-md grid-cols-2 gap-4 sm:max-w-2xl sm:grid-cols-3 lg:grid-cols-4">
          {items.map((video) => (
            <Link key={video.id} href={`/watch/${video.id}`} className="group">
              <div className="relative aspect-[9/16] overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-800">
                {video.thumbnail && (
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                )}
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <span className="rounded-full bg-white/90 p-2.5 text-red-600">
                    <PlaySquare size={18} />
                  </span>
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {video.title}
              </p>
              <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                {video.views > 0 ? `${formatViews(video.views)} views` : ''}
              </p>
            </Link>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-8 text-sm text-zinc-500 dark:text-zinc-400">
            Loading more shorts…
          </div>
        )}

        {!nextPageToken && !loading && items.length > 0 && (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-zinc-500 dark:text-zinc-400">
            <span className="h-1 w-1 rounded-full bg-zinc-400 dark:bg-zinc-600" />
            <span>You&apos;ve reached the end of Shorts</span>
            <span className="h-1 w-1 rounded-full bg-zinc-400 dark:bg-zinc-600" />
          </div>
        )}

        {nextPageToken && !error && (
          <div ref={sentinelRef} className="h-px" />
        )}
      </main>
    </div>
  )
}
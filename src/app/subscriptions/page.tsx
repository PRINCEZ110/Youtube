'use client'

import { useEffect, useState } from 'react'
import { Tv } from 'lucide-react'
import Link from 'next/link'
import TopNav from '@/components/layout/TopNav'
import Sidebar from '@/components/layout/Sidebar'
import MobileNav from '@/components/layout/MobileNav'
import VideoCard from '@/components/video/VideoCard'
import VideoCardSkeleton from '@/components/ui/VideoCardSkeleton'
import FeedError from '@/components/ui/FeedError'
import EmptyState from '@/components/ui/EmptyState'
import { useSubscriptions } from '@/context/SubscriptionsContext'
import type { ApiError, Video } from '@/lib/youtube/types'

const MAX_CHANNELS = 12
const PER_CHANNEL = 6

export default function SubscriptionsPage() {
  const { subscriptions } = useSubscriptions()
  const [videos, setVideos] = useState<Video[] | null>(null)
  const [error, setError] = useState<ApiError | null>(null)

  useEffect(() => {
    if (subscriptions.length === 0) {
      return
    }
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
            if (!body.ok || !body.data) {
              throw (
                body.error ??
                ({ kind: 'unknown', message: 'Could not load subscriptions.', retryable: true } as ApiError)
              )
            }
            return body.data.items
          })
        )
        if (cancelled) return
        const merged = results
          .flat()
          .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
          .filter((v, i, arr) => arr.findIndex((x) => x.id === v.id) === i)
        setVideos(merged)
        setError(null)
      } catch (err) {
        if (!cancelled) setError(err as ApiError)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [subscriptions])

  const loading = subscriptions.length > 0 && videos === null && !error

  return (
    <div className="min-h-full bg-white dark:bg-black">
      <TopNav />
      <MobileNav />
      <div className="flex">
        <Sidebar />
        <main className="min-w-0 flex-1 px-4 py-4 sm:px-6">
          <h1 className="mb-1 flex items-center gap-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            <Tv size={22} className="text-red-600" />
            Subscriptions
          </h1>
          {subscriptions.length > 0 && videos !== null && (
            <p className="mb-5 text-sm text-zinc-600 dark:text-zinc-400">
              Latest from {subscriptions.length} channel{subscriptions.length === 1 ? '' : 's'}
            </p>
          )}

          {subscriptions.length === 0 && (
            <EmptyState
              message="No subscriptions yet — subscribe to channels to see their uploads here."
              icon={Tv}
            />
          )}

          {subscriptions.length > 0 && loading && (
            <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => (
                <VideoCardSkeleton key={i} />
              ))}
            </div>
          )}

          {error && subscriptions.length > 0 && (
            <FeedError error={error} onRetry={() => setVideos(null)} />
          )}

          {videos !== null && videos.length === 0 && (
            <p className="py-24 text-center text-zinc-500 dark:text-zinc-400">
              Nothing uploaded yet. Go <Link href="/" className="underline">home</Link> and explore.
            </p>
          )}

          {videos !== null && videos.length > 0 && (
            <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
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
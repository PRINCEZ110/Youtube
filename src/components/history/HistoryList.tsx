'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2 } from 'lucide-react'
import ChannelAvatar from '@/components/ui/ChannelAvatar'
import FeedError from '@/components/ui/FeedError'
import VideoCardSkeleton from '@/components/ui/VideoCardSkeleton'
import { useHistory } from '@/context/HistoryContext'
import { formatViews, timeAgo } from '@/lib/utils'
import type { ApiError, Video } from '@/lib/youtube/types'

export default function HistoryList() {
  const { entries, remove, clear } = useHistory()
  const [videos, setVideos] = useState<Video[]>([])
  const [error, setError] = useState<ApiError | null>(null)

  const ids = entries.map((e) => e.id)
  const missingCount = ids.filter((id) => !videos.some((v) => v.id === id)).length
  const loading = missingCount > 0 && error === null

  useEffect(() => {
    const toLoad = ids.filter((id) => !videos.some((v) => v.id === id))
    if (toLoad.length === 0) return
    let cancelled = false

    const load = async () => {
      try {
        const res = await fetch(
          `/api/youtube/videos?mode=details&ids=${encodeURIComponent(toLoad.join(','))}`
        )
        const body = (await res.json()) as { ok: boolean; data?: Video[]; error?: ApiError }
        if (cancelled) return
        if (!body.ok || !body.data) {
          setError(body.error ?? { kind: 'unknown', message: 'Failed to load history.', retryable: true })
          return
        }
        setVideos((prev) => [
          ...prev,
          ...body.data!.filter((v) => !prev.some((p) => p.id === v.id)),
        ])
        setError(null)
      } catch {
        if (!cancelled) setError({ kind: 'network', message: 'Could not load history.', retryable: true })
      }
    }
    void load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries.length])

  function handleRemove(id: string, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    remove(id)
  }

  const shown = entries
    .map((entry) => {
      const video = videos.find((v) => v.id === entry.id)
      return video ? { ...entry, video } : null
    })
    .filter((item): item is { id: string; watchedAt: string; video: Video } => !!item)
    .sort((a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime())

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Watch history</h1>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            Stored locally in your browser — never sent anywhere.
          </p>
        </div>
        {entries.length > 0 && (
          <button
            onClick={clear}
            className="flex-nowrap rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium whitespace-nowrap text-zinc-800 transition-colors hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Clear all
          </button>
        )}
      </div>

      {error && <FeedError error={error} compact />}

      {loading && (
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && entries.length === 0 && (
        <p className="py-16 text-center text-zinc-500 dark:text-zinc-400">
          No watch history yet. Videos you watch will show up here.
        </p>
      )}

      {shown.length > 0 && (
        <ul className="flex flex-col gap-4">
          {shown.map(({ id, watchedAt, video }) => (
            <li key={id} className="group flex items-center gap-4">
              <Link href={`/watch/${id}`} className="flex min-w-0 flex-1 items-center gap-4">
                <div className="relative aspect-video w-44 shrink-0 overflow-hidden rounded-lg bg-zinc-200 dark:bg-zinc-800">
                  {video.thumbnail && (
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      fill
                      sizes="176px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {video.title}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <ChannelAvatar
                      name={video.channelName}
                      avatarUrl={video.channelAvatar}
                      size={24}
                    />
                    <span className="truncate text-xs text-zinc-600 dark:text-zinc-400">
                      {video.channelName}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {video.views > 0 ? `${formatViews(video.views)} views · ` : ''}
                    watched {timeAgo(watchedAt)}
                  </p>
                </div>
              </Link>
              <button
                onClick={(e) => handleRemove(id, e)}
                aria-label={`Remove ${video.title} from history`}
                className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 sm:opacity-0 sm:group-hover:opacity-100 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
              >
                <Trash2 size={18} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Play } from 'lucide-react'
import { usePlayback } from '@/context/PlaybackContext'
import { formatDuration } from '@/lib/utils'
import type { Video } from '@/lib/youtube/types'

interface ShelfItem {
  video: Video
  position: number
}

export default function ContinueWatching() {
  const { getPositions } = usePlayback()
  const [items, setItems] = useState<ShelfItem[] | null>(null)

  useEffect(() => {
    let cancelled = false
    const positions = getPositions()
    const resumeable = Object.entries(positions)
      .filter(([, entry]) => entry.p > 12)
      .sort((a, b) => b[1].t - a[1].t)
      .slice(0, 12)
    if (resumeable.length === 0) {
      return
    }
    const ids = resumeable.map(([id]) => id).join(',')

    fetch(`/api/youtube/videos?mode=details&ids=${ids}`)
      .then((res) => res.json())
      .then((body) => {
        if (cancelled) return
        const payload = body as { ok: boolean; data?: Video[] }
        if (!payload.ok || !payload.data) return
        const placed = new Map(resumeable)
        setItems(
          payload.data
            .filter((video) => video.durationSeconds > 0)
            .filter((video) => placed.has(video.id))
            .map((video) => ({ video, position: placed.get(video.id)!.p }))
        )
      })
      .catch(() => {
        if (!cancelled) setItems(null)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!items || items.length === 0) {
    return null
  }

  return (
    <section className="mb-8">
      <h2 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        Continue watching
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
        {items.map(({ video, position }) => {
          const left = Math.max(0, Math.round(video.durationSeconds - position))
          const progress =
            video.durationSeconds > 0
              ? Math.min(100, (position / video.durationSeconds) * 100)
              : 0
          return (
            <Link
              key={video.id}
              href={`/watch/${video.id}`}
              className="group w-64 shrink-0 sm:w-72"
            >
              <div className="relative aspect-video overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-800">
                {video.thumbnail && (
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    fill
                    sizes="288px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                )}
                <span className="absolute right-2 bottom-2 z-10 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
                  {formatDuration(video.durationSeconds)}
                </span>
                {left > 0 && (
                  <span className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <span className="flex items-center gap-1 rounded-full bg-zinc-900/90 px-4 py-2 text-xs font-semibold text-white">
                      <Play size={14} className="fill-white" />
                      {formatDuration(left)} left
                    </span>
                  </span>
                )}
                <span className="absolute inset-x-0 bottom-0 h-1 bg-white/30">
                  <span
                    className="block h-full bg-red-600"
                    style={{ width: `${progress}%` }}
                  />
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {video.title}
              </p>
              <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">{video.channelName}</p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
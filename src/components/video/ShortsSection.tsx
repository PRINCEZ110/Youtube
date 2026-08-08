'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { PlaySquare } from 'lucide-react'
import { formatViews } from '@/lib/utils'
import type { Video } from '@/lib/youtube/types'

/** 9:16 vertical short cards in a horizontal row — the YouTube shorts rail. */
export default function ShortsSection() {
  const [shorts, setShorts] = useState<Video[] | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/youtube/search?q=shorts&order=viewCount&limit=24')
      .then((res) => res.json())
      .then((body) => {
        if (cancelled) return
        const payload = body as { ok: boolean; data?: { items: Video[] } }
        if (!payload.ok || !payload.data) return
        setShorts(payload.data.items)
      })
      .catch(() => {
        if (!cancelled) setShorts([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (!shorts || shorts.length === 0) {
    return null
  }

  return (
    <section id="shorts" className="mb-10 scroll-mt-20">
      <Link
        href="/shorts"
        className="mb-4 flex items-center gap-3 text-xl font-semibold text-zinc-900 hover:opacity-80 dark:text-zinc-100"
      >
        <PlaySquare size={26} className="text-red-600" />
        Shorts
      </Link>
      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
        {shorts.map((video) => (
          <Link
            key={video.id}
            href={`/watch/${video.id}`}
            className="group w-36 shrink-0 sm:w-44"
          >
            <div className="relative aspect-[9/16] overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-800">
              {video.thumbnail && (
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  fill
                  sizes="176px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              )}
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <span className="rounded-full bg-white/90 p-2.5 text-red-600">
                  <PlaySquare size={20} />
                </span>
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {video.title}
            </p>
            <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
              {video.views > 0 ? `${formatViews(video.views)} views` : 'Shorts'}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { formatViews, timeAgo } from '@/lib/utils'
import type { Video } from '@/lib/data/mockVideos'

export default function ContinueWatchingRow({ videos }: { videos: Video[] }) {
  if (videos.length === 0) return null

  return (
    <div className="flex gap-3 overflow-x-auto">
      {videos.map((video) => (
        <Link
          key={video.id}
          href={`/watch/${video.id}`}
          className="group w-40 shrink-0"
        >
          <div className="relative aspect-video overflow-hidden rounded-xl">
            <Image
              src={video.thumbnail}
              alt={video.title}
              fill
              sizes="160px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <p className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
            {video.title}
          </p>
          <p className="mt-1 truncate text-xs text-zinc-600 dark:text-zinc-400">
            {video.channelName}
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            {formatViews(video.views)} · {timeAgo(video.uploadedAt)}
          </p>
        </Link>
      ))}
    </div>
  )
}

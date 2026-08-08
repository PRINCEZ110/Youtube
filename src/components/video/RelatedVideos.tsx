'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatDuration, formatViews, timeAgo } from '@/lib/utils'
import type { Video } from '@/lib/youtube/types'

export default function RelatedVideos({ videos }: { videos: Video[] }) {
  if (videos.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      {videos.map((video) => (
        <Link
          key={video.id}
          href={`/watch/${video.id}`}
          className="group flex gap-3 rounded-xl p-2 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900"
        >
          <div className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-lg bg-zinc-200 dark:bg-zinc-800">
            {video.thumbnail && (
              <Image
                src={video.thumbnail}
                alt={video.title}
                fill
                sizes="160px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            )}
            {video.durationSeconds > 0 && !video.live && (
              <span className="absolute right-1 bottom-1 rounded bg-black/80 px-1 text-[10px] font-medium text-white">
                {formatDuration(video.durationSeconds)}
              </span>
            )}
            {video.live && (
              <span className="absolute right-1 bottom-1 rounded bg-red-600 px-1 text-[10px] font-semibold text-white">
                LIVE
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="line-clamp-2 text-sm font-semibold text-zinc-900 group-hover:text-zinc-600 dark:text-zinc-100 dark:group-hover:text-zinc-300">
              {video.title}
            </p>
            <p className="mt-0.5 block truncate text-xs text-zinc-600 dark:text-zinc-400">
              {video.channelName}
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              {video.views > 0 ? `${formatViews(video.views)} views · ` : ''}
              {timeAgo(video.publishedAt)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}
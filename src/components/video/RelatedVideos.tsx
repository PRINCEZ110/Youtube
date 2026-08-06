'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAppSelector } from '@/store/hooks'
import { formatDuration, formatViews, timeAgo } from '@/lib/utils'

export default function RelatedVideos() {
  const related = useAppSelector((s) => s.videos.relatedVideos)

  if (related.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      {related.map((video) => (
        <Link
          key={video.id}
          href={`/watch/${video.id}`}
          className="group flex gap-3"
        >
          <div className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-lg">
            <Image
              src={video.thumbnail}
              alt={video.title}
              fill
              sizes="160px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <span className="absolute right-1 bottom-1 rounded bg-black/80 px-1 text-[10px] font-medium text-white">
              {formatDuration(video.duration)}
            </span>
          </div>
          <div className="min-w-0">
            <p className="line-clamp-2 text-sm font-semibold text-zinc-900 group-hover:text-zinc-600 dark:text-zinc-100 dark:group-hover:text-zinc-300">
              {video.title}
            </p>
            <p className="mt-0.5 truncate text-xs text-zinc-600 dark:text-zinc-400">
              {video.channelName}
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              {formatViews(video.views)} · {timeAgo(video.uploadedAt)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}
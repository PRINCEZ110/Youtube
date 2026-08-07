'use client'

import { memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BadgeCheck } from 'lucide-react'
import ChannelAvatar from '@/components/ui/ChannelAvatar'
import WatchLaterButton from '@/components/ui/WatchLaterButton'
import { formatDuration, formatViews, timeAgo } from '@/lib/utils'
import type { Video } from '@/lib/data/mockVideos'

function VideoCard({
  video,
  progress,
  verified = false,
}: {
  video: Video
  progress?: number
  verified?: boolean
}) {
  return (
    <div className="group flex flex-col gap-3">
      <Link
        href={`/watch/${video.id}`}
        className="relative block aspect-video overflow-hidden rounded-xl"
      >
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute right-2 bottom-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
          {formatDuration(video.duration)}
        </span>
        {typeof progress === 'number' && (
          <span className="absolute inset-x-0 bottom-0 h-1 bg-black/40">
            <span
              className="block h-full bg-red-600"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </span>
        )}
      </Link>

      <div className="flex gap-3">
        <ChannelAvatar name={video.channelName} avatarUrl={video.channelAvatar} size={40} />
        <div className="flex min-w-0 flex-1 gap-2">
          <div className="min-w-0 flex-1">
            <Link
              href={`/watch/${video.id}`}
              className="line-clamp-2 font-semibold leading-snug text-zinc-900 hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-300"
            >
              {video.title}
            </Link>
            <p className="mt-1 flex items-center gap-1 truncate text-sm text-zinc-600 dark:text-zinc-400">
              {video.channelName}
              {verified && <BadgeCheck size={14} className="shrink-0 text-zinc-500 dark:text-zinc-400" />}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {formatViews(video.views)} · {timeAgo(video.uploadedAt)}
            </p>
          </div>
          <WatchLaterButton videoId={video.id} />
        </div>
      </div>
    </div>
  )
}

export default memo(VideoCard)

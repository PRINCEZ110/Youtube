'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Play } from 'lucide-react'
import ChannelAvatar from '@/components/ui/ChannelAvatar'
import WatchLaterButton from '@/components/ui/WatchLaterButton'
import CardMenu from '@/components/ui/CardMenu'
import { formatDuration, formatViews, timeAgo } from '@/lib/utils'
import type { Video } from '@/lib/youtube/types'

export default function VideoCard({ video }: { video: Video }) {
  return (
    <div className="group flex flex-col gap-3">
      <Link
        href={`/watch/${video.id}`}
        className="relative block aspect-video overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-800"
      >
        {video.thumbnail && (
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        )}
        {video.durationSeconds > 0 && !video.live && (
          <span className="absolute right-2 bottom-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
            {formatDuration(video.durationSeconds)}
          </span>
        )}
        {video.live && (
          <span className="absolute right-2 bottom-2 rounded bg-red-600 px-1.5 py-0.5 text-xs font-semibold text-white">
            LIVE
          </span>
        )}
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <Play size={44} className="fill-white/90 text-white/90 drop-shadow" />
        </span>
      </Link>

      <div className="flex gap-3">
        <ChannelAvatar
          name={video.channelName}
          avatarUrl={video.channelAvatar}
          size={40}
          channelId={video.channelId}
        />
        <div className="flex min-w-0 flex-1 gap-2">
          <div className="min-w-0 flex-1">
            <Link
              href={`/watch/${video.id}`}
              className="line-clamp-2 font-semibold leading-snug text-zinc-900 hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-300"
            >
              {video.title}
            </Link>
            <Link
              href={`/channel/${video.channelId}`}
              className="mt-1 block truncate text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              {video.channelName}
            </Link>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {video.views > 0 ? `${formatViews(video.views)} views · ` : ''}
              {timeAgo(video.publishedAt)}
            </p>
          </div>
          <div className="flex shrink-0 items-start gap-0.5 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
            <WatchLaterButton videoId={video.id} />
            <CardMenu video={video} align="right" />
          </div>
        </div>
      </div>
    </div>
  )
}
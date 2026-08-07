'use client'

import { useState } from 'react'
import { MoreHorizontal, ThumbsDown, ThumbsUp } from 'lucide-react'
import ChannelAvatar from '@/components/ui/ChannelAvatar'
import WatchLaterButton from '@/components/ui/WatchLaterButton'
import { formatViews, timeAgo } from '@/lib/utils'
import type { Video } from '@/lib/data/mockVideos'

export default function VideoInfo({ video }: { video: Video }) {
  const [expanded, setExpanded] = useState(false)
  const [liked, setLiked] = useState<boolean | null>(null)
  const [likes, setLikes] = useState(1200)
  const [subscribed, setSubscribed] = useState(false)

  function toggleLike() {
    if (liked === true) {
      setLiked(null)
      setLikes((n) => n - 1)
    } else {
      setLiked(true)
      setLikes((n) => n + 1)
    }
  }

  function toggleDislike() {
    if (liked === false) {
      setLiked(null)
    } else {
      if (liked === true) setLikes((n) => n - 1)
      setLiked(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      <h1 className="text-lg font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
        {video.title}
      </h1>

      <div className="flex flex-wrap items-center gap-4">
        <ChannelAvatar name={video.channelName} avatarUrl={video.channelAvatar} size={44} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {video.channelName}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {formatViews(video.views)} views · {timeAgo(video.uploadedAt)}
          </p>
        </div>
        <button
          onClick={() => setSubscribed((s) => !s)}
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {subscribed ? 'Subscribed' : 'Subscribe'}
        </button>
        <WatchLaterButton videoId={video.id} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={toggleLike}
          aria-pressed={liked === true}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800 ${
            liked === true
              ? 'bg-zinc-100 text-blue-600 dark:bg-zinc-900 dark:text-blue-400'
              : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200'
          }`}
        >
          <ThumbsUp size={18} /> {formatViews(likes)}
        </button>
        <button
          onClick={toggleDislike}
          aria-pressed={liked === false}
          className={`rounded-full bg-zinc-100 p-2 text-zinc-800 transition-colors hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 ${
            liked === false ? 'text-blue-600 dark:text-blue-400' : ''
          }`}
        >
          <ThumbsDown size={18} />
        </button>
        <button className="flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800">
          Share
        </button>
        <button
          aria-label="More actions"
          className="rounded-full bg-zinc-100 p-2 text-zinc-800 transition-colors hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="rounded-xl bg-zinc-100 p-4 text-sm dark:bg-zinc-900">
        <p className={`whitespace-pre-line text-zinc-800 dark:text-zinc-200 ${expanded ? '' : 'line-clamp-3'}`}>
          {video.description}
        </p>
        <button
          onClick={() => setExpanded((e) => !e)}
          className="mt-2 font-semibold text-zinc-900 dark:text-zinc-100"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      </div>
    </div>
  )
}

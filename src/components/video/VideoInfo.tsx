'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Share, ThumbsDown, ThumbsUp } from 'lucide-react'
import ChannelAvatar from '@/components/ui/ChannelAvatar'
import WatchLaterButton from '@/components/ui/WatchLaterButton'
import { formatViews, timeAgo } from '@/lib/utils'
import { useLiked } from '@/context/LikedContext'
import { useSubscriptions } from '@/context/SubscriptionsContext'
import type { Channel, Video } from '@/lib/youtube/types'

export default function VideoInfo({
  video,
  channel,
}: {
  video: Video
  channel?: Channel | null
}) {
  const [expanded, setExpanded] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)
  const { liked, toggleLike } = useLiked()
  const { subscriptions, toggleSubscription } = useSubscriptions()

  const isLiked = liked.includes(video.id)
  const subscribed = subscriptions.includes(video.channelId)
  const subscriberCount = channel?.subscriberCount

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    } catch {
      // Clipboard unavailable; ignore silently.
    }
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      <h1 className="text-lg font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
        {video.title}
      </h1>

      <div className="flex flex-wrap items-center gap-4">
        <ChannelAvatar
          name={video.channelName}
          avatarUrl={video.channelAvatar}
          size={44}
          channelId={video.channelId}
        />
        <div className="min-w-0 flex-1">
          <Link
            href={`/channel/${video.channelId}`}
            className="block truncate text-sm font-semibold text-zinc-900 hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-300"
          >
            {video.channelName}
          </Link>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {subscriberCount !== undefined && subscriberCount > 0
              ? `${formatViews(subscriberCount)} subscribers · `
              : ''}
            {video.views > 0 ? `${formatViews(video.views)} views · ` : ''}
            {timeAgo(video.publishedAt)}
          </p>
        </div>
        <button
          onClick={() => toggleSubscription(video.channelId)}
          aria-pressed={subscribed}
          title={
            subscribed
              ? 'Subscribed locally (not a real YouTube subscription)'
              : 'Subscribe locally'
          }
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            subscribed
              ? 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800'
              : 'bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300'
          }`}
        >
          {subscribed && <Check size={16} />}
          {subscribed ? 'Subscribed' : 'Subscribe'}
        </button>
        <WatchLaterButton videoId={video.id} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900">
          <button
            onClick={() => toggleLike(video.id)}
            aria-pressed={isLiked}
            title={
              isLiked
                ? 'Saved to your local likes — this is not a real YouTube like'
                : 'Like (saved locally, not a real YouTube like)'
            }
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
              isLiked
                ? 'bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-800 hover:bg-zinc-200 dark:text-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            <ThumbsUp size={18} fill={isLiked ? 'currentColor' : 'none'} />
            {video.likeCount > 0 ? formatViews(video.likeCount) : 'Like'}
          </button>
          <span className="h-5 w-px bg-zinc-300 dark:bg-zinc-700" />
          <button
            aria-label="Dislike (not stored locally)"
            className="px-4 py-2 text-zinc-800 transition-colors hover:bg-zinc-200 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <ThumbsDown size={18} />
          </button>
        </div>
        <button
          onClick={copyShareLink}
          className="flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <Share size={16} />
          {shareCopied ? 'Link copied' : 'Share'}
        </button>
      </div>

      {isLiked && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Saved to your likes (local only — not a real YouTube like).
        </p>
      )}

      <div className="rounded-xl bg-zinc-100 p-4 text-sm dark:bg-zinc-900">
        <p
          className={`whitespace-pre-line text-zinc-800 dark:text-zinc-200 ${expanded ? '' : 'line-clamp-3'}`}
        >
          {video.description || 'No description provided for this video.'}
        </p>
        {video.description.length > 220 && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="mt-2 font-semibold text-zinc-900 dark:text-zinc-100"
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
    </div>
  )
}
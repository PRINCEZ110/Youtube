'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Bookmark, Clock, ThumbsUp } from 'lucide-react'
import ChannelAvatar from '@/components/ui/ChannelAvatar'
import FeedError from '@/components/ui/FeedError'
import VideoCard from '@/components/video/VideoCard'
import VideoCardSkeleton from '@/components/ui/VideoCardSkeleton'
import { useLiked } from '@/context/LikedContext'
import { useSubscriptions } from '@/context/SubscriptionsContext'
import { useWatchLater } from '@/context/WatchLaterContext'
import type { ApiError, Channel, Video } from '@/lib/youtube/types'

interface VideoSectionProps {
  title: string
  icon: React.ReactNode
  ids: string[]
  emptyText: string
}

function VideoSection({ title, icon, ids, emptyText }: VideoSectionProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [error, setError] = useState<ApiError | null>(null)

  const key = ids.join(',')
  const missing = ids.filter((id) => !videos.some((v) => v.id === id))
  const loading = missing.length > 0 && error === null

  useEffect(() => {
    if (missing.length === 0) return
    let cancelled = false

    const load = async () => {
      try {
        const res = await fetch(
          `/api/youtube/videos?mode=details&ids=${encodeURIComponent(missing.join(','))}`
        )
        const body = (await res.json()) as { ok: boolean; data?: Video[]; error?: ApiError }
        if (cancelled) return
        if (!body.ok || !body.data) {
          setError(body.error ?? { kind: 'unknown', message: 'Failed to load videos.', retryable: true })
          return
        }
        setVideos((prev) => [
          ...prev,
          ...body.data!.filter((v) => !prev.some((p) => p.id === v.id)),
        ])
        setError(null)
      } catch {
        if (!cancelled) setError({ kind: 'network', message: 'Could not load videos.', retryable: true })
      }
    }
    void load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  if (ids.length === 0) {
    return (
      <section className="flex flex-col gap-4">
        <h2 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
          {icon}
          {title}
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{emptyText}</p>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
        {icon}
        {title}
        <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">{ids.length}</span>
      </h2>
      {error && <FeedError error={error} compact />}
      {loading && videos.length === 0 ? (
        <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 3 }, (_, i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {ids
            .map((id) => videos.find((v) => v.id === id))
            .filter((v): v is Video => !!v)
            .map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
        </div>
      )}
    </section>
  )
}

export default function LibraryClient() {
  const { saved } = useWatchLater()
  const { liked } = useLiked()
  const { subscriptions } = useSubscriptions()

  const [channels, setChannels] = useState<Channel[]>([])
  const [channelsError, setChannelsError] = useState<ApiError | null>(null)
  const subscriptionList = subscriptions.join(',')

  useEffect(() => {
    if (subscriptions.length === 0) return
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch(
          `/api/youtube/channels?ids=${encodeURIComponent(subscriptionList)}`
        )
        const body = (await res.json()) as { ok: boolean; data?: Channel[]; error?: ApiError }
        if (cancelled) return
        if (!body.ok || !body.data) {
          setChannelsError(
            body.error ?? { kind: 'unknown', message: 'Failed to load channels.', retryable: true }
          )
          return
        }
        setChannels(body.data)
      } catch {
        if (!cancelled)
          setChannelsError({ kind: 'network', message: 'Could not load channels.', retryable: true })
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [subscriptionList, subscriptions.length])

  const knownChannelIds = useMemo(() => new Set(channels.map((c) => c.id)), [channels])
  const channelsLoading = subscriptions.some((id) => !knownChannelIds.has(id))

  return (
    <div className="flex flex-col gap-10">
      <VideoSection
        title="Watch later"
        icon={<Bookmark size={18} className="text-zinc-600 dark:text-zinc-300" />}
        ids={saved}
        emptyText="Nothing saved yet. Hit the bookmark on any video to put it here."
      />

      <VideoSection
        title="Liked videos"
        icon={<ThumbsUp size={18} className="text-zinc-600 dark:text-zinc-300" />}
        ids={liked}
        emptyText="Videos you like will show up here — stored locally, just for you."
      />

      {subscriptions.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
            <Clock size={18} className="text-zinc-600 dark:text-zinc-300" />
            Subscribed channels
          </h2>
          {channelsError && <FeedError error={channelsError} compact />}
          {channelsLoading ? (
            <div className="flex animate-pulse gap-6">
              {subscriptions.map((id) => (
                <div key={id} className="h-16 w-16 rounded-full bg-zinc-200 dark:bg-zinc-800" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-6">
              {channels.map((channel) => (
                <Link
                  key={channel.id}
                  href={`/channel/${channel.id}`}
                  className="flex w-24 flex-col items-center gap-2 text-center"
                >
                  <ChannelAvatar
                    name={channel.name}
                    avatarUrl={channel.avatar}
                    size={64}
                  />
                  <span className="line-clamp-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    {channel.name}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
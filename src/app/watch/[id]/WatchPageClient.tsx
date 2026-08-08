'use client'

import { useEffect, useState } from 'react'
import VideoPlayer from '@/components/video/VideoPlayer'
import VideoInfo from '@/components/video/VideoInfo'
import RelatedVideos from '@/components/video/RelatedVideos'
import CommentSection from '@/components/video/CommentSection'
import FeedError from '@/components/ui/FeedError'
import WatchPageSkeleton from '@/components/ui/WatchPageSkeleton'
import { useHistory } from '@/context/HistoryContext'
import { useSubscriptions } from '@/context/SubscriptionsContext'
import type { ApiError, Comment, Video } from '@/lib/youtube/types'

export default function WatchPageClient({
  video,
  relatedVideos,
  comments,
  commentsNextPageToken,
  initialError,
  videoKey,
}: {
  video: Video | null
  relatedVideos: Video[]
  comments: Comment[]
  commentsNextPageToken: string | null
  initialError: ApiError | null
  videoKey?: string
}) {
  const { record } = useHistory()
  const { subscriptions } = useSubscriptions()
  const [theater, setTheater] = useState(false)

  useEffect(() => {
    if (video && video.id) {
      record(video.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video?.id])

  if (initialError && !video) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <FeedError error={initialError} compact />
      </main>
    )
  }

  if (!video) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-6">
        <WatchPageSkeleton />
      </main>
    )
  }

  const subscribedChannels = new Set(subscriptions)

  return (
    <main className="mx-auto flex max-w-[1600px] gap-6 px-4 py-6">
      <div className="min-w-0 flex-1">
        <VideoPlayer
          key={video.id}
          video={video}
          relatedVideos={relatedVideos}
          autoplayChannels={subscribedChannels}
          playerKey={videoKey ?? video.id}
          theater={theater}
          onTheaterChange={setTheater}
        />
        <VideoInfo video={video} />
        <CommentSection
          key={video.id}
          videoId={video.id}
          initialComments={comments}
          initialNextPageToken={commentsNextPageToken}
        />
        {relatedVideos.length > 0 && (
          <div className={`mt-6 ${theater ? '' : 'lg:hidden'}`}>
            <RelatedVideos videos={relatedVideos} />
          </div>
        )}
      </div>
      <aside className={`hidden w-96 shrink-0 ${theater ? 'lg:hidden' : 'lg:block'}`}>
        <RelatedVideos videos={relatedVideos} />
      </aside>
    </main>
  )
}
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import TopNav from '@/components/layout/TopNav'
import MobileNav from '@/components/layout/MobileNav'
import WatchPageClient from './WatchPageClient'
import { getCommentThreads, getRelatedVideos, getVideoById } from '@/lib/youtube/endpoints'
import { YouTubeApiError } from '@/lib/youtube/client'
import type { ApiError } from '@/lib/youtube/types'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const video = await getVideoByIdOrNull(id)
  if (!video) {
    return { title: 'Video not found — YouTube Clone' }
  }
  return {
    title: `${video.title} — YouTube Clone`,
    description: video.description.slice(0, 160),
  }
}

async function getVideoByIdOrNull(id: string) {
  try {
    return await getVideoById(id)
  } catch (err) {
    if (err instanceof YouTubeApiError) return undefined
    throw err
  }
}

export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let video
  let related
  let comments
  let commentsNextPageToken: string | null = null
  let error: ApiError | null = null

  try {
    video = await getVideoById(id)
  } catch (err) {
    error =
      err instanceof YouTubeApiError
        ? err.toApiError()
        : { kind: 'unknown', message: 'Could not load this video.', retryable: false }
  }

  if (error?.kind === 'not-found') {
    notFound()
  }

  if (video) {
    const [relatedPage, commentsPage] = await Promise.all([
      getRelatedVideos(video).catch(() => null),
      getCommentThreads(id).catch(() => null),
    ])

    related = relatedPage ?? []
    comments = commentsPage?.items ?? []
    commentsNextPageToken = commentsPage?.nextPageToken ?? null
  } else if (!error) {
    error = { kind: 'not-found', message: 'This video is unavailable.', retryable: false }
  }

  return (
    <div className="min-h-full bg-white dark:bg-black">
      <TopNav />
      <MobileNav />
      <WatchPageClient
        video={video ?? null}
        relatedVideos={related ?? []}
        comments={comments ?? []}
        commentsNextPageToken={commentsNextPageToken}
        initialError={error}
      />
    </div>
  )
}
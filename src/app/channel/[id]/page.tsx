import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import TopNav from '@/components/layout/TopNav'
import MobileNav from '@/components/layout/MobileNav'
import ChannelPageClient from './ChannelPageClient'
import { getChannelById } from '@/lib/youtube/endpoints'
import { YouTubeApiError } from '@/lib/youtube/client'
import type { ApiError } from '@/lib/youtube/types'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const channel = await getChannelByIdOrNull(id)
  if (!channel) {
    return { title: 'Channel not found — YouTube Clone' }
  }
  return {
    title: `${channel.name} — YouTube Clone`,
    description: channel.description.slice(0, 160),
  }
}

async function getChannelByIdOrNull(id: string) {
  try {
    return await getChannelById(id)
  } catch (err) {
    if (err instanceof YouTubeApiError) return undefined
    throw err
  }
}

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let channel
  let error: ApiError | null = null
  try {
    channel = await getChannelById(id)
  } catch (err) {
    error =
      err instanceof YouTubeApiError
        ? err.toApiError()
        : { kind: 'unknown', message: 'Could not load this channel.', retryable: false }
  }

  if (error?.kind === 'not-found') {
    notFound()
  }

  return (
    <div className="min-h-full bg-white dark:bg-black">
      <TopNav />
      <MobileNav />
      <ChannelPageClient channel={channel ?? null} initialError={error} />
    </div>
  )
}
import { mockVideos, type Video } from '@/lib/data/mockVideos'
import { mockComments, type Comment } from '@/lib/data/mockComments'
import { PAGINATION } from '@/lib/constants'

export interface Channel {
  id: string
  name: string
  avatar: string
  subscriberCount: number
  videoCount: number
  description: string
  joinedDate: Date
}

export interface FetchVideosParams {
  page: number
  pageSize: number
  categoryId?: string
}

export type SearchSort = 'relevance' | 'date' | 'views'

export interface SearchParams {
  q: string
  sort?: SearchSort
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

const avatarUrl = (seed: number) => `https://picsum.photos/seed/${seed}/48/48`

const userComments: Comment[] = []

function buildChannels(): Channel[] {
  const byChannel = new Map<string, Video[]>()
  for (const video of mockVideos) {
    const list = byChannel.get(video.channelId)
    if (list) {
      list.push(video)
    } else {
      byChannel.set(video.channelId, [video])
    }
  }
  return Array.from(byChannel.entries()).map(([id, videos]) => {
    const first = videos[0]
    const totalViews = videos.reduce((sum, video) => sum + video.views, 0)
    return {
      id,
      name: first.channelName,
      avatar: first.channelAvatar,
      subscriberCount: Math.round(totalViews / 8),
      videoCount: videos.length,
      description: `The official channel of ${first.channelName}.`,
      joinedDate: videos.reduce(
        (earliest, video) => (video.uploadedAt < earliest ? video.uploadedAt : earliest),
        first.uploadedAt
      ),
    }
  })
}

export const mockChannels: Channel[] = buildChannels()

export async function fetchVideos({
  page,
  pageSize,
  categoryId,
}: FetchVideosParams): Promise<Video[]> {
  await delay(300)
  const filtered =
    categoryId && categoryId !== 'all'
      ? mockVideos.filter((video) => video.categoryId === categoryId)
      : mockVideos
  const start = (page - 1) * pageSize
  return filtered.slice(start, start + pageSize)
}

export async function getVideo(id: string): Promise<Video | undefined> {
  await delay(300)
  return mockVideos.find((video) => video.id === id)
}

export async function getRelatedVideos(id: string): Promise<Video[]> {
  await delay(300)
  const video = mockVideos.find((current) => current.id === id)
  if (!video) return []
  return mockVideos
    .filter(
      (candidate) =>
        candidate.id !== id &&
        (candidate.categoryId === video.categoryId ||
          candidate.tags.some((tag) => video.tags.includes(tag)))
    )
    .slice(0, PAGINATION.RELATED_VIDEOS_COUNT)
}

export async function searchVideos({ q, sort = 'relevance' }: SearchParams): Promise<Video[]> {
  await delay(300)
  const query = q.trim().toLowerCase()
  const results = mockVideos.filter((video) => {
    if (!query) return true
    const haystack = [video.title, video.channelName, video.description, ...video.tags]
      .join(' ')
      .toLowerCase()
    return haystack.includes(query)
  })
  if (sort === 'date') {
    results.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
  } else if (sort === 'views') {
    results.sort((a, b) => b.views - a.views)
  }
  return results
}

export async function getTrendingSearches(): Promise<string[]> {
  await delay(300)
  const counts = new Map<string, number>()
  for (const video of mockVideos) {
    for (const tag of video.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8)
    .map(([tag]) => tag)
}

export async function getChannel(id: string): Promise<Channel | undefined> {
  await delay(300)
  return mockChannels.find((channel) => channel.id === id)
}

export async function getChannelVideos(id: string): Promise<Video[]> {
  await delay(300)
  return mockVideos.filter((video) => video.channelId === id)
}

export async function getComments(videoId: string): Promise<Comment[]> {
  await delay(300)
  return [...userComments, ...mockComments]
    .filter((comment) => comment.videoId === videoId)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

export async function addComment(videoId: string, text: string): Promise<Comment> {
  await delay(300)
  const comment: Comment = {
    id: `c-${Date.now()}`,
    videoId,
    channelName: 'You',
    channelAvatar: avatarUrl(999),
    text,
    likes: 0,
    timestamp: new Date(),
  }
  userComments.unshift(comment)
  return comment
}
import { mockVideos } from '@/lib/data/mockVideos'

export interface Channel {
  id: string
  name: string
  avatar: string
  banner: string
  subscriberCount: number
  verified: boolean
  about: string
}

const bannerUrl = (seed: number) => `https://picsum.photos/seed/${seed}/1280/280`

function buildChannelMap(): Record<string, Channel> {
  const map: Record<string, Channel> = {}
  const seen = new Set<string>()
  let index = 0
  for (const video of mockVideos) {
    if (seen.has(video.channelId)) continue
    seen.add(video.channelId)
    const channelVideos = mockVideos.filter((candidate) => candidate.channelId === video.channelId)
    const totalViews = channelVideos.reduce((sum, candidate) => sum + candidate.views, 0)
    map[video.channelId] = {
      id: video.channelId,
      name: video.channelName,
      avatar: video.channelAvatar,
      banner: bannerUrl(1000 + index),
      subscriberCount: Math.round(totalViews / 6),
      verified: index % 2 === 0,
      about: `Official channel of ${video.channelName}. All uploads live here first, from ${video.categoryId} content to channel exclusives.`,
    }
    index += 1
  }
  return map
}

export const channelMap: Record<string, Channel> = buildChannelMap()

export function getChannel(id: string): Channel | undefined {
  return channelMap[id]
}
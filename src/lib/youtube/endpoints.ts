import { cached } from './cache'
import { getRegionCode, youtubeFetch } from './client'
import {
  attachChannelAvatars,
  mapChannelItem,
  mapCommentThreadItem,
  mapVideoItem,
  LOCAL_CATEGORY_LABELS,
  reconcileCategories,
  YT_CATEGORY_IDS,
} from './mapper'
import type {
  Channel,
  Comment,
  LocalCategoryId,
  PageResponse,
  RawChannelItem,
  RawCommentThreadItem,
  RawPage,
  RawSearchItem,
  RawVideoCategoryItem,
  RawVideoItem,
  Video,
} from './types'
import { YouTubeApiError } from './client'

// TTLs (ms) — tuned to conserve YouTube quota while keeping data fresh enough
// for a YouTube-like experience.
export const CACHE_TTL = {
  feed: 15 * 60_000,
  videos: 15 * 60_000,
  search: 30 * 60_000,
  comments: 10 * 60_000,
  channels: 60 * 60_000,
  categories: 7 * 24 * 60 * 60_000,
} as const

function envelope<T>(items: T[], page: RawPage<unknown>): PageResponse<T> {
  return {
    items,
    nextPageToken: page.nextPageToken ?? null,
    totalResults: page.pageInfo?.totalResults ?? null,
  }
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

type CategoryMap = Record<Exclude<LocalCategoryId, 'all'>, number>

async function loadCategoryMapFromApi(): Promise<CategoryMap | null> {
  try {
    const { data } = await youtubeFetch<RawPage<RawVideoCategoryItem>>('/videoCategories', {
      part: 'snippet',
      regionCode: getRegionCode(),
    })
    if (!data.items.length) return null
    return reconcileCategories(data.items)
  } catch {
    // Fall back to the hardcoded stable mapping (see mapper.ts).
    return null
  }
}

const getCategoryMap = async (): Promise<CategoryMap> =>
  cached('yt:categoryMap', CACHE_TTL.categories, async () => {
    return (await loadCategoryMapFromApi()) ?? YT_CATEGORY_IDS
  })

/**
 * Resolves a local category id to a YouTube videoCategoryId.
 * Throws for unknown categories so the UI can show a helpful error.
 */
export async function resolveCategoryId(category: Exclude<LocalCategoryId, 'all'>): Promise<number> {
  if (!(category in YT_CATEGORY_IDS)) {
    throw new YouTubeApiError('invalid', `Unknown category: "${category}".`)
  }
  const map = await getCategoryMap()
  return map[category]
}

export interface PopularFeedParams {
  category?: LocalCategoryId | null
  pageToken?: string
  maxResults?: number
}

/** videos.list chart=mostPopular — the home feed. */
export async function getPopularFeed(
  params: PopularFeedParams = {}
): Promise<PageResponse<Video>> {
  const { category = 'all', pageToken, maxResults = 12 } = params
  const regionCode = getRegionCode()
  const cacheKey = `feed:${category}:${regionCode}:${maxResults}:${pageToken ?? ''}`

  return cached(cacheKey, CACHE_TTL.feed, async () => {
    const videoCategoryId =
      category && category !== 'all' ? await resolveCategoryId(category) : undefined
    const { data } = await youtubeFetch<RawPage<RawVideoItem>>('/videos', {
      part: 'snippet,contentDetails,statistics',
      chart: 'mostPopular',
      regionCode,
      videoCategoryId,
      maxResults,
      pageToken,
    })
    const videos = data.items.map(mapVideoItem)
    return envelope(videos, data)
  })
}

/** videos.list by ids — details for watch page, history, library, likes. */
export async function getVideosByIds(ids: string[]): Promise<Video[]> {
  const uniqueIds = [...new Set(ids.filter(Boolean))]
  if (uniqueIds.length === 0) return []

  const chunks: string[][] = []
  for (let i = 0; i < uniqueIds.length; i += 20) {
    chunks.push(uniqueIds.slice(i, i + 20))
  }

  const results = await Promise.all(
    chunks.map((chunk) => {
      const cacheKey = `videos:${[...chunk].sort().join(',')}`
      return cached(cacheKey, CACHE_TTL.videos, async () => {
        const { data } = await youtubeFetch<RawPage<RawVideoItem>>('/videos', {
          part: 'snippet,contentDetails,statistics',
          id: chunk.join(','),
          maxResults: chunk.length,
        })
        return data.items.map(mapVideoItem)
      })
    })
  )

  const videos = results.flat()
  const byId = new Map(videos.map((v) => [v.id, v]))
  const channelIds = uniqueIds.map((id) => byId.get(id)?.channelId ?? '').filter(Boolean)
  const avatars = await getChannelAvatars(channelIds)
  return attachChannelAvatars(videos, avatars)
}

export async function getVideoById(id: string): Promise<Video | null> {
  const videos = await getVideosByIds([id])
  return videos[0] ?? null
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

const HOMEPAGE_MAX = 12

export interface SearchParams {
  q?: string
  channelId?: string
  pageToken?: string
  maxResults?: number
  order?: 'relevance' | 'date' | 'viewCount'
  videoDuration?: 'short' | 'medium' | 'long'
}

async function searchRaw(params: SearchParams): Promise<RawPage<RawSearchItem>> {
  const { data } = await youtubeFetch<RawPage<RawSearchItem>>('/search', {
    part: 'snippet',
    q: params.q,
    channelId: params.channelId,
    type: 'video',
    maxResults: params.maxResults ?? HOMEPAGE_MAX,
    order: params.order,
    videoDuration: params.videoDuration,
    videoEmbeddable: 'true',
    pageToken: params.pageToken,
  })
  return data
}

/** search.list mapped to videos (optionally enriched with full snippets in one videos.list call). */
export async function getSearchVideos(
  params: SearchParams
): Promise<PageResponse<Video>> {
  const q = (params.q ?? '').trim()
  const cacheKey = `search:${q || params.channelId || ''}:${params.order ?? 'relevance'}:${params.videoDuration ?? 'any'}:${params.maxResults ?? 12}:${params.pageToken ?? ''}`
  const maxResults = params.maxResults ?? 12

  const page = await cached(cacheKey, CACHE_TTL.search, () => searchRaw(params))

  const searched: Video[] = []
  const videoIds: string[] = []
  for (const item of page.items) {
    if (item.id?.videoId) {
      videoIds.push(item.id.videoId)
      searched.push({
        id: item.id.videoId,
        title: item.snippet?.title ?? '',
        description: item.snippet?.description ?? '',
        channelId: item.snippet?.channelId ?? '',
        channelName: item.snippet?.channelTitle ?? '',
        channelAvatar: '',
        thumbnail: item.snippet?.thumbnails?.medium?.url ?? item.snippet?.thumbnails?.default?.url ?? '',
        thumbnailHigh: item.snippet?.thumbnails?.high?.url ?? '',
        views: 0,
        publishedAt: item.snippet?.publishedAt ?? '',
        durationSeconds: 0,
        categoryId: 'all',
        tags: [],
        likeCount: 0,
        live: (item.snippet?.liveBroadcastContent ?? 'none') === 'live',
      })
    }
  }

  // One follow-up call adds reliable stats/duration/view counts for the whole page.
  let details = new Map<string, Video>()
  try {
    const full = await getVideosByIds(videoIds.slice(0, maxResults))
    details = new Map(full.map((v) => [v.id, v]))
  } catch {
    // Authorized search hits still render thumbnails without full details.
  }

  const items = searched.slice(0, maxResults).map((v) => ({ ...details.get(v.id) ?? v }))
  const byChannel = new Map(items.filter((v) => v.channelId).map((v) => [v.channelId, v.channelName]))
  const avatars = await getChannelAvatars([...byChannel.keys()])
  return {
    items: attachChannelAvatars(items, avatars),
    nextPageToken: page.nextPageToken ?? null,
    totalResults: page.pageInfo?.totalResults ?? null,
  }
}

// ------------------------------------------------------------------ channels

/** channels.list by ids (fills channelAvatar on videos too). */
export async function getChannelsByIds(ids: string[]): Promise<Channel[]> {
  const uniqueIds = [...new Set(ids.filter(Boolean))]
  if (!uniqueIds.length) return []
  const chunks: string[][] = []
  for (let i = 0; i < uniqueIds.length; i += 50) chunks.push(uniqueIds.slice(i, i + 50))
  const results = await Promise.all(
    chunks.map((chunk) =>
      cached(`channels:${[...chunk].sort().join(',')}`, CACHE_TTL.channels, async () => {
        const { data } = await youtubeFetch<RawPage<RawChannelItem>>('/channels', {
          part: 'snippet,statistics,contentDetails,brandingSettings',
          id: chunk.join(','),
          maxResults: chunk.length,
        })
        return (data.items ?? []).map(mapChannelItem)
      })
    )
  )
  return results.flat()
}

export async function getChannelById(id: string): Promise<Channel | null> {
  const channels = await getChannelsByIds([id])
  return channels[0] ?? null
}

/** Map of channelId -> avatar URL for a batch of channel ids. */
export async function getChannelAvatars(ids: string[]): Promise<Map<string, string>> {
  const channels = await getChannelsByIds(ids)
  return new Map(channels.map((channel) => [channel.id, channel.avatar]))
}

/** Channel videos via search.list (uploads playlist would need playlistItems). */
export function getChannelVideos(
  channelId: string,
  pageToken?: string,
  maxResults = 12
): Promise<PageResponse<Video>> {
  return getSearchVideos({ channelId, pageToken, maxResults, order: 'date' })
}

// ------------------------------------------------------------------ comments

/** commentThreads.list — top-level threads with top replies; read-only. */
export async function getCommentThreads(
  videoId: string,
  pageToken?: string,
  maxResults = 20,
  order: 'relevance' | 'time' = 'relevance'
): Promise<PageResponse<Comment>> {
  const cacheKey = `comments:${videoId}:${order}:${maxResults}:${pageToken ?? ''}`
  return cached(cacheKey, CACHE_TTL.comments, async () => {
    const { data } = await youtubeFetch<RawPage<RawCommentThreadItem>>('/commentThreads', {
      part: 'snippet,replies',
      videoId,
      textFormat: 'plainText',
      maxResults,
      pageToken,
      order,
    })
    return envelope(data.items.map(mapCommentThreadItem), data)
  })
}

// ------------------------------------------------------------------ related

/**
 * relatedToVideoId was deprecated/removed by YouTube, so related videos are built
 * by re-querying search.list with the video's tags / category as terms.
 */
export async function getRelatedVideos(video: Video, limit = 8): Promise<Video[]> {
  const terms = (video.tags?.length ? video.tags.slice(0, 3) : [video.title])
    .join(' ')
    .slice(0, 400)
  if (!terms.trim()) return []

  const { items } = await getSearchVideos({
    q: terms,
    maxResults: limit + 2,
  })
  return items.filter((candidate) => candidate.id !== video.id).slice(0, limit)
}

export const CATEGORY_LABELS = LOCAL_CATEGORY_LABELS
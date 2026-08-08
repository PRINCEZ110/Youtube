import type {
  Channel,
  Comment,
  LocalCategoryId,
  RawChannelItem,
  RawCommentThreadItem,
  RawSearchItem,
  RawVideoCategoryItem,
  RawVideoItem,
  Thumbnails,
  Video,
} from './types'

/**
 * Stable YouTube videoCategoryId values (US). These are the fallback mapping if
 * videoCategories.list can't be reached; endpoints.ts reconciles with the live
 * category list when a key is configured.
 */
export const YT_CATEGORY_IDS: Record<Exclude<LocalCategoryId, 'all'>, number> = {
  music: 10,
  gaming: 20,
  news: 25,
  sports: 17,
  education: 27,
  entertainment: 24,
  technology: 28,
}

/** Reverse map: YouTube videoCategoryId -> local category id. */
export const LOCAL_CATEGORY_BY_YT_ID: Record<string, LocalCategoryId> = Object.fromEntries(
  Object.entries(YT_CATEGORY_IDS).map(([localId, ytId]) => [String(ytId), localId as LocalCategoryId])
) as Record<string, LocalCategoryId>

/** Best-known names for the videoCategoryIds we care about. */
export const LOCAL_CATEGORY_LABELS: Record<Exclude<LocalCategoryId, 'all'>, string> = {
  music: 'Music',
  gaming: 'Gaming',
  news: 'News',
  sports: 'Sports',
  education: 'Education',
  entertainment: 'Entertainment',
  technology: 'Technology',
}

const ISO_DURATION_RE = /^PT(?:(?:(\d+)H))?(?:(?:(\d+)M))?(?:(?:(\d+))(?:\.\d+)?S)?$/

/** Parses ISO-8601 duration (e.g. "PT1H2M3S") to seconds. */
export function isoDurationToSeconds(iso: string): number {
  // Use a non-capturing-group split so the regex stays ES2017-compatible:
  // PT(1H)(2M)(3S) captured as [hours, minutes, seconds].
  const match = ISO_DURATION_RE.exec(iso.trim())
  if (!match) return 0
  const hours = Number(match[1] ?? 0)
  const minutes = Number(match[2] ?? 0)
  const seconds = Number(match[3] ?? 0)
  return hours * 3600 + minutes * 60 + seconds
}

/** Maps a YouTube categoryId (string like "10") to a local category id, or 'all' when unknown. */
export function mapYtCategoryId(ytCategoryId: string | undefined): LocalCategoryId {
  if (!ytCategoryId) return 'all'
  return LOCAL_CATEGORY_BY_YT_ID[ytCategoryId] ?? 'all'
}

/** Maps only categories known to the app; everything else becomes the generic 'all' feed. */
function mapLocalCategoryId(ytCategoryId: string | undefined): LocalCategoryId {
  return mapYtCategoryId(ytCategoryId)
}

interface ThumbSnapshot {
  medium: string
  high: string
}

export function pickThumbnails(thumbnails: Thumbnails | undefined): ThumbSnapshot {
  return {
    medium: thumbnails?.medium?.url ?? thumbnails?.high?.url ?? thumbnails?.default?.url ?? '',
    high: thumbnails?.high?.url ?? thumbnails?.medium?.url ?? thumbnails?.default?.url ?? '',
  }
}

export function toNumber(value: string | undefined): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export function mapVideoItem(item: RawVideoItem): Video {
  const thumbs = pickThumbnails(item.snippet?.thumbnails)
  return {
    id: item.id,
    title: item.snippet?.title ?? 'Untitled video',
    description: item.snippet?.description ?? '',
    channelId: item.snippet?.channelId ?? '',
    channelName: item.snippet?.channelTitle ?? 'Unknown channel',
    channelAvatar: '',
    thumbnail: thumbs.medium,
    thumbnailHigh: thumbs.high,
    views: toNumber(item.statistics?.viewCount),
    publishedAt: item.snippet?.publishedAt ?? '',
    durationSeconds: item.contentDetails?.duration
      ? isoDurationToSeconds(item.contentDetails.duration)
      : 0,
    categoryId: mapLocalCategoryId(item.snippet?.categoryId),
    tags: item.snippet?.tags ?? [],
    likeCount: toNumber(item.statistics?.likeCount),
    live: item.snippet?.liveBroadcastContent === 'live',
  }
}

/** Keeps a raw search item that is a video, or null for channel/playlist hits. */
export function mapSearchVideoItem(item: RawSearchItem): Video | null {
  const videoId = item.id?.videoId
  if (!videoId) return null
  return mapVideoItem({ ...item, id: videoId })
}

/** Computes per-channel avatars for a batch of videos (snippets carry no avatar). */
export function attachChannelAvatars(videos: Video[], avatars: Map<string, string>): Video[] {
  return videos.map((video) => ({
    ...video,
    channelAvatar: video.channelAvatar || avatars.get(video.channelId) || '',
  }))
}

export function mapChannelItem(item: RawChannelItem): Channel {
  const thumbs = pickThumbnails(item.snippet?.thumbnails)
  const statistics = item.statistics ?? {}
  return {
    id: item.id,
    name: item.snippet?.title ?? 'Unknown channel',
    avatar: thumbs.medium || thumbs.high,
    banner: item.brandingSettings?.image?.bannerExternalUrl ?? '',
    subscriberCount: toNumber(statistics.subscriberCount),
    videoCount: toNumber(statistics.videoCount),
    viewCount: toNumber(statistics.viewCount),
    description: item.snippet?.description ?? '',
    verified: false,
    country: item.snippet?.country ?? '',
    publishedAt: item.snippet?.publishedAt ?? '',
  }
}

export function mapCommentThreadItem(thread: RawCommentThreadItem): Comment {
  const top = thread.snippet?.topLevelComment
  const replies = (thread.replies?.comments ?? []).map((reply) => ({
    id: reply.id,
    videoId: top?.snippet?.videoId ?? thread.snippet?.videoId ?? '',
    authorName: reply.snippet?.authorDisplayName ?? '',
    authorChannelId: reply.snippet?.authorChannelId?.value ?? '',
    authorAvatar: reply.snippet?.authorProfileImageUrl ?? '',
    text: reply.snippet?.textDisplay ?? '',
    likes: toNumber(reply.snippet?.likeCount),
    publishedAt: reply.snippet?.publishedAt ?? '',
    replies: [],
  }))
  return {
    id: thread.id,
    videoId: thread.snippet?.videoId ?? '',
    authorName: top?.snippet?.authorDisplayName ?? '',
    authorChannelId: top?.snippet?.authorChannelId?.value ?? '',
    authorAvatar: top?.snippet?.authorProfileImageUrl ?? '',
    text: top?.snippet?.textDisplay ?? '',
    likes: toNumber(top?.snippet?.likeCount),
    publishedAt: top?.snippet?.publishedAt ?? '',
    replies,
  }
}

/**
 * Reconciles the live videoCategories.list response with the known mapping so
 * category chips always use the correct videoCategoryId for the configured region.
 */
export function reconcileCategories(
  items: RawVideoCategoryItem[]
): Record<Exclude<LocalCategoryId, 'all'>, number> {
  const byTitle: Record<string, Exclude<LocalCategoryId, 'all'>> = {
    Music: 'music',
    Gaming: 'gaming',
    News: 'news',
    'News & Politics': 'news',
    Sports: 'sports',
    Education: 'education',
    Entertainment: 'entertainment',
    'Technology': 'technology',
    'Science & Technology': 'technology',
  }
  const reconciled = { ...YT_CATEGORY_IDS }
  for (const item of items) {
    const local = byTitle[item.snippet?.title ?? '']
    if (local) reconciled[local] = Number(item.id)
  }
  return reconciled
}
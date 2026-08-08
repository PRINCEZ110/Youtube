/**
 * YouTube Data API v3 raw response types plus the normalized types the UI consumes.
 * Raw types mirror the documented API JSON; normalized types are the app-facing shapes.
 */

export type LocalCategoryId =
  | 'all'
  | 'music'
  | 'gaming'
  | 'news'
  | 'sports'
  | 'education'
  | 'entertainment'
  | 'technology'

// ---------- Raw YouTube API v3 types ----------

export interface ThumbnailResource {
  url: string
  width?: number
  height?: number
}

export interface Thumbnails {
  default?: ThumbnailResource
  medium?: ThumbnailResource
  high?: ThumbnailResource
  standard?: ThumbnailResource
  maxres?: ThumbnailResource
}

export interface VideoSnippet {
  publishedAt: string
  channelId: string
  title: string
  description: string
  thumbnails: Thumbnails
  channelTitle: string
  tags?: string[]
  categoryId?: string
  liveBroadcastContent: 'live' | 'none' | 'upcoming'
  defaultLanguage?: string
  localized?: { title: string; description: string }
}

export interface VideoContentDetails {
  duration?: string
  dimension?: string
  definition?: string
  caption?: string
  licensedContent?: boolean
  regionRestriction?: { allowed?: string[]; blocked?: string[] }
  contentRating?: Record<string, unknown>
}

export interface VideoStatistics {
  viewCount?: string
  likeCount?: string
  favoriteCount?: string
  commentCount?: string
}

export interface VideoCategorySnippet {
  channelId?: string
  title?: string
  assignable?: boolean
}

export interface RawVideoItem {
  kind: string
  etag: string
  id: string
  snippet?: VideoSnippet
  contentDetails?: VideoContentDetails
  statistics?: VideoStatistics
}

export interface RawSearchItem {
  kind: string
  etag: string
  id: { kind: string; videoId?: string; channelId?: string; playlistId?: string }
  snippet?: VideoSnippet
}

export type RawVideoCategoryItem = {
  kind: string
  etag: string
  id: string
  snippet?: VideoCategorySnippet
}

export interface RawChannelItem {
  kind: string
  etag: string
  id: string
  snippet?: {
    title: string
    description: string
    publishedAt: string
    thumbnails: Thumbnails
    country?: string
    localized?: { title: string; description: string }
  }
  statistics?: {
    viewCount?: string
    subscriberCount?: string
    hiddenSubscriberCount?: boolean
    videoCount?: string
  }
  contentDetails?: {
    relatedPlaylists?: { likes?: string; uploads?: string }
  }
  brandingSettings?: {
    image?: { bannerExternalUrl?: string }
  }
}

export interface RawCommentThreadItem {
  kind: string
  etag: string
  id: string
  snippet?: {
    channelId: string
    videoId: string
    topLevelComment: RawCommentItem
    canReply?: boolean
    totalReplyCount: number
    isPublic?: boolean
  }
  replies?: {
    comments: RawCommentItem[]
  }
}

export interface RawCommentItem {
  kind: string
  etag: string
  id: string
  snippet?: {
    channelId?: string
    videoId?: string
    textDisplay: string
    textOriginal: string
    parentId?: string
    authorDisplayName: string
    authorProfileImageUrl: string
    authorChannelUrl: string
    authorChannelId?: { value: string }
    likeCount?: string
    publishedAt: string
    updatedAt?: string
  }
}

export interface RawPage<T> {
  kind: string
  etag: string
  nextPageToken?: string
  prevPageToken?: string
  pageInfo?: { totalResults?: number; resultsPerPage?: number }
  items: T[]
}

export interface RawErrorResponse {
  error?: {
    code?: number
    message?: string
    errors?: Array<{ reason?: string; message?: string; domain?: string }>
    status?: string
  }
}

// ------------------------------------------------------------------
// Normalized (app-facing) types
// ------------------------------------------------------------------

export interface Video {
  id: string
  title: string
  description: string
  channelId: string
  channelName: string
  channelAvatar: string
  thumbnail: string
  thumbnailHigh: string
  views: number
  publishedAt: string
  durationSeconds: number
  categoryId: LocalCategoryId
  tags: string[]
  likeCount: number
  live: boolean
}

export interface Channel {
  id: string
  name: string
  avatar: string
  banner: string
  subscriberCount: number
  videoCount: number
  viewCount: number
  description: string
  verified: boolean
  country: string
  publishedAt: string
}

export interface Comment {
  id: string
  videoId: string
  authorName: string
  authorChannelId: string
  authorAvatar: string
  text: string
  likes: number
  publishedAt: string
  replies: Comment[]
}

/** Paged payload as exposed by the app's API routes. */
export interface PageResponse<T> {
  items: T[]
  nextPageToken: string | null
  totalResults: number | null
  estimatedResults?: number | null
}

export type ApiErrorKind =
  | 'missing-key'
  | 'quota-exceeded'
  | 'rate-limit'
  | 'not-found'
  | 'invalid'
  | 'network'
  | 'unknown'

export interface ApiError {
  kind: ApiErrorKind
  message: string
  detail?: string
  retryable: boolean
}

/** Unified response envelope returned by every /api/youtube/* route. */
export type ApiResponse<T> =
  | { ok: true; data: T; cached?: boolean }
  | { ok: false; error: ApiError }
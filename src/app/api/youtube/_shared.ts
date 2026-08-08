import { YouTubeApiError } from '@/lib/youtube/client'
import type { ApiError } from '@/lib/youtube/types'

/** Normalizes any thrown error into the ApiError envelope used by API routes. */
export function toApiError(err: unknown): ApiError {
  if (err instanceof YouTubeApiError) return err.toApiError()
  return {
    kind: 'unknown',
    message: err instanceof Error ? err.message : 'An unexpected error occurred.',
    retryable: false,
  }
}

/** HTTP status that best matches an ApiError.kind. */
export function errorStatus(kind: ApiError['kind']): number {
  switch (kind) {
    case 'invalid':
      return 400
    case 'not-found':
      return 404
    case 'missing-key':
      return 503
    default:
      return 502
  }
}

/** Cache-Control header good for aggressively-cached rote data. */
export function cacheHeader(maxAgeSeconds: number): string {
  return `public, s-maxage=${maxAgeSeconds}, stale-while-revalidate=${maxAgeSeconds * 6}`
}

export function clampInt(value: string | null, min: number, max: number, fallback: number): number {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, Math.trunc(n)))
}
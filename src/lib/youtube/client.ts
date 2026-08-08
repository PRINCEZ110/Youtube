import type { ApiError, ApiErrorKind, RawErrorResponse } from './types'

export const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3'

/**
 * The API key must NEVER reach the browser. This module is only imported from
 * server code (API route handlers / server components). The runtime guard below
 * is a second line of defense against accidental client-bundle imports.
 */
export function getApiKey(): string | null {
  if (typeof window !== 'undefined') {
    throw new Error(
      'youtube client module must only be imported on the server (the API key would leak).'
    )
  }
  return process.env.YOUTUBE_API_KEY ?? null
}

export function getRegionCode(): string {
  return process.env.YOUTUBE_REGION ?? 'US'
}

export class YouTubeApiError extends Error {
  readonly kind: ApiErrorKind
  readonly code: number | null
  readonly reason: string | null
  readonly retryable: boolean

  constructor(
    kind: ApiErrorKind,
    message: string,
    opts: { code?: number | null; reason?: string | null } = {}
  ) {
    super(message)
    this.name = 'YouTubeApiError'
    this.kind = kind
    this.code = opts.code ?? null
    this.reason = opts.reason ?? null
    this.retryable = kind === 'quota-exceeded' || kind === 'rate-limit' || kind === 'network'
  }

  toApiError(): ApiError {
    return {
      kind: this.kind,
      message: this.message,
      detail: this.reason ?? undefined,
      retryable: this.retryable,
    }
  }
}

interface FetchOptions {
  timeoutMs?: number
}

export interface YouTubeFetchResult<T> {
  ok: boolean
  data: T
  cached: boolean
}

/**
 * Low-level GET against the YouTube Data API. Services request handling (error
 * classification) so every route surfaces a consistent ApiError shape.
 */
export async function youtubeFetch<T>(
  pathname: string,
  params: Record<string, string | number | boolean | undefined>,
  opts: FetchOptions = {}
): Promise<YouTubeFetchResult<T>> {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new YouTubeApiError(
      'missing-key',
      'YOUTUBE_API_KEY is not configured. Add it to your .env file to load real YouTube data.'
    )
  }

  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue
    query.set(key, String(value))
  }
  query.set('key', apiKey)

  const controller = new AbortController()
  const timeoutMs = opts.timeoutMs ?? 15_000
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(`${YOUTUBE_API_BASE_URL}${pathname}?${query.toString()}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })

    if (!res.ok) {
      let raw: RawErrorResponse | null = null
      try {
        raw = (await res.json()) as RawErrorResponse
      } catch {
        raw = null
      }
      throw buildHttpError(res.status, raw)
    }

    return { ok: true, data: (await res.json()) as T, cached: false }
  } catch (err) {
    if (err instanceof YouTubeApiError) throw err
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new YouTubeApiError('network', 'The YouTube API request timed out.')
    }
    throw new YouTubeApiError(
      'network',
      'Could not reach the YouTube API. Check your network connection and try again.'
    )
  } finally {
    clearTimeout(timer)
  }
}

function buildHttpError(status: number, raw: RawErrorResponse | null): YouTubeApiError {
  const reason = raw?.error?.errors?.[0]?.reason ?? null
  const message =
    raw?.error?.message ??
    raw?.error?.errors?.[0]?.message ??
    `YouTube API responded with HTTP ${status}`

  if (status === 403 && reason === 'quotaExceeded') {
    return new YouTubeApiError(
      'quota-exceeded',
      'YouTube API quota exceeded for today. Please try again later, or add a new YOUTUBE_API_KEY.',
      { code: status, reason }
    )
  }
  if (status === 429) {
    return new YouTubeApiError('rate-limit', 'Too many requests to the YouTube API. Slow down a bit.', {
      code: status,
      reason,
    })
  }
  if (status === 404) {
    return new YouTubeApiError('not-found', 'The requested resource does not exist on YouTube.', {
      code: status,
      reason,
    })
  }
  if (status === 400) {
    return new YouTubeApiError('invalid', 'The request to YouTube was invalid.', {
      code: status,
      reason,
    })
  }
  if (reason === 'accessNotConfigured') {
    return new YouTubeApiError(
      'invalid',
      'The YouTube Data API is not enabled for this API key. Enable it in Google Cloud Console.',
      { code: status, reason }
    )
  }
  if (status >= 500) {
    return new YouTubeApiError('network', 'YouTube API is having issues right now. Try again shortly.', {
      code: status,
      reason,
    })
  }
  return new YouTubeApiError('unknown', message, { code: status, reason })
}
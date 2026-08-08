import { NextRequest, NextResponse } from 'next/server'
import { CACHE_TTL, getSearchVideos } from '@/lib/youtube/endpoints'
import { cacheHeader, clampInt, errorStatus, toApiError } from '@/app/api/youtube/_shared'

/**
 * GET /api/youtube/search?q=...&pageToken=...&channelId=...&limit=...&order=...&duration=short|medium|long
 * Real, pageToken-based pagination via search.list + videos.list enrichment.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const q = (params.get('q') ?? '').trim()
  const channelId = (params.get('channelId') ?? '').trim()
  const pageToken = params.get('pageToken') || undefined
  const limit = clampInt(params.get('limit'), 1, 50, 12)
  const orderParam = (params.get('order') ?? 'relevance') as 'relevance' | 'date' | 'viewCount'
  const order = orderParam === 'date' || orderParam === 'viewCount' ? orderParam : 'relevance'
  const durationParam = (params.get('duration') ?? 'any') as string
  const duration =
    durationParam === 'short' || durationParam === 'medium' || durationParam === 'long'
      ? durationParam
      : undefined

  if (!q && !channelId) {
    return NextResponse.json(
      { ok: false, error: { kind: 'invalid', message: 'Missing "q" or "channelId" query param.', retryable: false } },
      { status: 400 }
    )
  }

  try {
    const data = await getSearchVideos({ q, channelId, pageToken, maxResults: limit, order, videoDuration: duration })
    return NextResponse.json({ ok: true, data }, { headers: { 'Cache-Control': cacheHeader(CACHE_TTL.search / 1000) } })
  } catch (err) {
    const error = toApiError(err)
    return NextResponse.json({ ok: false, error }, { status: errorStatus(error.kind) })
  }
}
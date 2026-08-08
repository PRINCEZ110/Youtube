import { NextRequest, NextResponse } from 'next/server'
import { CACHE_TTL, getCommentThreads } from '@/lib/youtube/endpoints'
import { cacheHeader, errorStatus, toApiError } from '@/app/api/youtube/_shared'

/**
 * GET /api/youtube/comments?videoId=...&pageToken=...&order=relevance|time
 * Real top-level comments via commentThreads.list (read-only).
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const videoId = (params.get('videoId') ?? '').trim()

  if (!videoId) {
    return NextResponse.json(
      { ok: false, error: { kind: 'invalid', message: 'Missing "videoId" query param.', retryable: false } },
      { status: 400 }
    )
  }

  try {
    const pageToken = params.get('pageToken') || undefined
    const orderParam = (params.get('order') ?? 'relevance') as 'relevance' | 'time'
    const order = orderParam === 'time' ? 'time' : 'relevance'
    const data = await getCommentThreads(videoId, pageToken, 20, order)
    return NextResponse.json({ ok: true, data }, { headers: { 'Cache-Control': cacheHeader(CACHE_TTL.comments / 1000) } })
  } catch (err) {
    const error = toApiError(err)
    return NextResponse.json({ ok: false, error }, { status: errorStatus(error.kind) })
  }
}
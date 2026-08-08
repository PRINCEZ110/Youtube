import { NextRequest, NextResponse } from 'next/server'
import { CACHE_TTL, getPopularFeed, getVideosByIds } from '@/lib/youtube/endpoints'
import type { LocalCategoryId } from '@/lib/youtube/types'
import { cacheHeader, clampInt, errorStatus, toApiError } from '@/app/api/youtube/_shared'

const VALID_CATEGORIES = new Set<LocalCategoryId>([
  'all',
  'music',
  'gaming',
  'news',
  'sports',
  'education',
  'entertainment',
  'technology',
])

/**
 * GET /api/youtube/videos
 *  ?mode=popular&category=music&pageToken=...  -> videos.list (chart=mostPopular)
 *  ?ids=id1,id2,id3                            -> videos.list by ids
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const mode = params.get('mode') ?? 'popular'

  try {
    if (mode === 'popular') {
      const categoryParam = (params.get('category') ?? 'all').toLowerCase() as LocalCategoryId
      if (!VALID_CATEGORIES.has(categoryParam)) {
        return NextResponse.json(
          { ok: false, error: { kind: 'invalid', message: `Unknown category: ${categoryParam}`, retryable: false } },
          { status: 400 }
        )
      }
      const maxResults = clampInt(params.get('limit'), 1, 50, 12)
      const pageToken = params.get('pageToken') || undefined
      const data = await getPopularFeed({ category: categoryParam, pageToken, maxResults })
      return NextResponse.json({ ok: true, data }, { headers: { 'Cache-Control': cacheHeader(CACHE_TTL.feed / 1000) } })
    }

    if (mode === 'details') {
      const ids = (params.get('ids') ?? '')
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean)
      if (ids.length === 0) {
        return NextResponse.json(
          { ok: false, error: { kind: 'invalid', message: 'Missing required "ids" query param.', retryable: false } },
          { status: 400 }
        )
      }
      const data = await getVideosByIds(ids.slice(0, 50))
      return NextResponse.json({ ok: true, data }, { headers: { 'Cache-Control': cacheHeader(CACHE_TTL.videos / 1000) } })
    }

    return NextResponse.json(
      { ok: false, error: { kind: 'invalid', message: `Unknown mode: ${mode}`, retryable: false } },
      { status: 400 }
    )
  } catch (err) {
    const error = toApiError(err)
    return NextResponse.json({ ok: false, error }, { status: errorStatus(error.kind) })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { CACHE_TTL, getChannelVideos, getChannelsByIds } from '@/lib/youtube/endpoints'
import { cacheHeader, errorStatus, toApiError } from '@/app/api/youtube/_shared'

/**
 * GET /api/youtube/channels
 *  ?ids=id1,id2        -> channels.list details for a batch of ids
 *  ?channelId=...&pageToken=... -> videos of that channel (search.list)
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const idsParam = (params.get('ids') ?? '').trim()
  const channelId = (params.get('channelId') ?? '').trim()

  try {
    if (channelId) {
      const pageToken = params.get('pageToken') || undefined
      const data = await getChannelVideos(channelId, pageToken)
      return NextResponse.json({ ok: true, data }, { headers: { 'Cache-Control': cacheHeader(CACHE_TTL.search / 1000) } })
    }

    if (idsParam) {
      const ids = idsParam.split(',').map((id) => id.trim()).filter(Boolean).slice(0, 50)
      const data = await getChannelsByIds(ids)
      return NextResponse.json({ ok: true, data }, { headers: { 'Cache-Control': cacheHeader(CACHE_TTL.channels / 1000) } })
    }

    return NextResponse.json(
      { ok: false, error: { kind: 'invalid', message: 'Missing "ids" or "channelId" query param.', retryable: false } },
      { status: 400 }
    )
  } catch (err) {
    const error = toApiError(err)
    return NextResponse.json({ ok: false, error }, { status: errorStatus(error.kind) })
  }
}
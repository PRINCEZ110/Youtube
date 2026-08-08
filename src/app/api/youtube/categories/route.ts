import { NextResponse } from 'next/server'
import { resolveCategoryId } from '@/lib/youtube/endpoints'
import type { LocalCategoryId } from '@/lib/youtube/types'
import { cacheHeader, errorStatus, toApiError } from '@/app/api/youtube/_shared'

const CATEGORIES: Exclude<LocalCategoryId, 'all'>[] = [
  'music',
  'gaming',
  'news',
  'sports',
  'education',
  'entertainment',
  'technology',
]

/**
 * GET /api/youtube/categories
 * Resolved videoCategoryIds for the region — used by the client feed so chip
 * clicks trigger the right mostPopular query.
 */
export async function GET() {
  try {
    const entries = await Promise.all(
      CATEGORIES.map(async (id) => [id, await resolveCategoryId(id)] as const)
    )
    const data = Object.fromEntries(entries)
    return NextResponse.json({ ok: true, data }, { headers: { 'Cache-Control': cacheHeader(24 * 3600) } })
  } catch (err) {
    const error = toApiError(err)
    return NextResponse.json({ ok: false, error }, { status: errorStatus(error.kind) })
  }
}
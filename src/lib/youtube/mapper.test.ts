import { describe, expect, it } from 'vitest'
import {
  isoDurationToSeconds,
  LOCAL_CATEGORY_BY_YT_ID,
  mapVideoItem,
  mapYtCategoryId,
  pickThumbnails,
  YT_CATEGORY_IDS,
} from './mapper'
import type { RawVideoItem } from './types'

describe('isoDurationToSeconds', () => {
  it('parses ISO-8601 durations', () => {
    expect(isoDurationToSeconds('PT1H2M3S')).toBe(3723)
    expect(isoDurationToSeconds('PT2M')).toBe(120)
    expect(isoDurationToSeconds('PT45S')).toBe(45)
    expect(isoDurationToSeconds('PT1H')).toBe(3600)
    expect(isoDurationToSeconds('P1DT2H')).toBe(0)
    expect(isoDurationToSeconds('garbage')).toBe(0)
    expect(isoDurationToSeconds('')).toBe(0)
  })
})

describe('category mapping', () => {
  it('maps known YouTube category ids', () => {
    expect(mapYtCategoryId('10')).toBe('music')
    expect(mapYtCategoryId('20')).toBe('gaming')
    expect(mapYtCategoryId('25')).toBe('news')
    expect(mapYtCategoryId('17')).toBe('sports')
  })

  it('maps unknown and missing ids to all', () => {
    expect(mapYtCategoryId('9999')).toBe('all')
    expect(mapYtCategoryId(undefined)).toBe('all')
  })

  it('keeps maps consistent', () => {
    for (const [local, yt] of Object.entries(YT_CATEGORY_IDS)) {
      expect(LOCAL_CATEGORY_BY_YT_ID[String(yt)]).toBe(local)
    }
  })
})

describe('pickThumbnails', () => {
  it('falls back through quality tiers', () => {
    expect(pickThumbnails(undefined)).toEqual({ medium: '', high: '' })
    expect(
      pickThumbnails({
        default: { url: 'd' },
        medium: { url: 'm' },
        high: { url: 'h' },
      })
    ).toEqual({ medium: 'm', high: 'h' })
    expect(pickThumbnails({ default: { url: 'd' } })).toEqual({ medium: 'd', high: 'd' })
  })
})

describe('mapVideoItem', () => {
  it('maps a raw video item to the app Video shape', () => {
    const raw = {
      id: 'abc123',
      snippet: {
        title: 'My Video',
        description: 'Desc',
        channelId: 'ch1',
        channelTitle: 'Channel One',
        categoryId: '10',
        publishedAt: '2026-01-01T00:00:00Z',
        tags: ['tag1'],
        liveBroadcastContent: 'none',
        thumbnails: { medium: { url: 'http://img/m' }, high: { url: 'http://img/h' } },
      },
      contentDetails: { duration: 'PT3M45S' },
      statistics: { viewCount: '1200', likeCount: '88' },
    } as unknown as RawVideoItem

    const video = mapVideoItem(raw)
    expect(video.id).toBe('abc123')
    expect(video.channelName).toBe('Channel One')
    expect(video.views).toBe(1200)
    expect(video.likeCount).toBe(88)
    expect(video.durationSeconds).toBe(225)
    expect(video.categoryId).toBe('music')
    expect(video.live).toBe(false)
    expect(video.thumbnail).toBe('http://img/m')
  })

  it('applies defaults for missing fields and detects live content', () => {
    const video = mapVideoItem({ id: 'v1' } as RawVideoItem)
    expect(video.title).toBe('Untitled video')
    expect(video.channelName).toBe('Unknown channel')
    expect(video.views).toBe(0)
    expect(video.live).toBe(false)

    const live = mapVideoItem({
      id: 'v2',
      snippet: { liveBroadcastContent: 'live' },
    } as RawVideoItem)
    expect(live.live).toBe(true)
  })
})
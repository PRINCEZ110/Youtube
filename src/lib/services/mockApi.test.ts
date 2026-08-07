import { describe, expect, it } from 'vitest'
import { fetchVideos, searchVideos } from '@/lib/services/mockApi'
import { mockVideos } from '@/lib/data/mockVideos'

describe('fetchVideos', () => {
  it('returns a paginated slice', async () => {
    const result = await fetchVideos({ page: 1, pageSize: 10 })
    expect(result).toHaveLength(10)
    expect(result[0].id).toBe(mockVideos[0].id)
  })

  it('returns the next slice on page 2', async () => {
    const page1 = await fetchVideos({ page: 1, pageSize: 5 })
    const page2 = await fetchVideos({ page: 2, pageSize: 5 })
    expect(page2).toHaveLength(5)
    expect(page1[0].id).toBe(mockVideos[0].id)
    expect(page2[0].id).toBe(mockVideos[5].id)
  })

  it('filters by categoryId', async () => {
    const result = await fetchVideos({ page: 1, pageSize: 100, categoryId: 'music' })
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((video) => video.categoryId === 'music')).toBe(true)
  })

  it('ignores the "all" category', async () => {
    const result = await fetchVideos({ page: 1, pageSize: 100, categoryId: 'all' })
    expect(result).toHaveLength(mockVideos.length)
  })
})

describe('searchVideos', () => {
  it('matches case-insensitively across titles and tags', async () => {
    const result = await searchVideos({ q: 'NEXT.JS' })
    expect(result.length).toBeGreaterThan(0)
    expect(result.some((video) => video.title === 'Building a Full-Stack App with Next.js 16 in 2026')).toBe(
      true
    )
  })

  it('matches on channel name', async () => {
    const result = await searchVideos({ q: 'codesphere' })
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((video) => video.channelName === 'CodeSphere')).toBe(true)
  })

  it('sorts by views descending', async () => {
    const result = await searchVideos({ q: '', sort: 'views' })
    expect(result).toHaveLength(mockVideos.length)
    for (let i = 1; i < result.length; i += 1) {
      expect(result[i - 1].views).toBeGreaterThanOrEqual(result[i].views)
    }
  })

  it('sorts by date descending', async () => {
    const result = await searchVideos({ q: '', sort: 'date' })
    for (let i = 1; i < result.length; i += 1) {
      expect(result[i - 1].uploadedAt.getTime()).toBeGreaterThanOrEqual(
        result[i].uploadedAt.getTime()
      )
    }
  })
})
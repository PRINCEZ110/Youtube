import { describe, expect, it, vi } from 'vitest'
import { formatCompactNumber, formatDuration, formatViews, highlightMatch, timeAgo } from './utils'

describe('formatViews', () => {
  it('formats small numbers as-is', () => {
    expect(formatViews(0)).toBe('0')
    expect(formatViews(999)).toBe('999')
  })

  it('formats thousands, millions, billions', () => {
    expect(formatViews(1_500)).toBe('1.5K')
    expect(formatViews(12_345_678)).toBe('12.3M')
    expect(formatViews(2_500_000_000)).toBe('2.5B')
  })
})

describe('formatDuration', () => {
  it('formats mm:ss for short videos', () => {
    expect(formatDuration(0)).toBe('0:00')
    expect(formatDuration(65)).toBe('1:05')
    expect(formatDuration(599)).toBe('9:59')
  })

  it('formats h:mm:ss for long videos', () => {
    expect(formatDuration(3661)).toBe('1:01:01')
    expect(formatDuration(7200)).toBe('2:00:00')
  })
})

describe('timeAgo', () => {
  it('handles invalid dates', () => {
    expect(timeAgo('not-a-date')).toBe('')
  })

  it('returns relative labels', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-08T12:00:00Z'))
    const now = new Date('2026-08-08T12:00:00Z')

    expect(timeAgo(new Date(now.getTime() - 30_000))).toBe('Just now')
    expect(timeAgo(new Date(now.getTime() - 5 * 60_000))).toBe('5m ago')
    expect(timeAgo(new Date(now.getTime() - 3 * 3_600_000))).toBe('3h ago')
    expect(timeAgo(new Date(now.getTime() - 2 * 86_400_000))).toBe('2d ago')
    expect(timeAgo(new Date(now.getTime() - 2 * 7 * 86_400_000))).toBe('2w ago')
    expect(timeAgo(new Date(now.getTime() - 4 * 30 * 86_400_000))).toBe('4mo ago')
    expect(timeAgo(new Date(now.getTime() - 3 * 365 * 86_400_000))).toBe('3y ago')

    vi.useRealTimers()
  })
})

describe('formatCompactNumber', () => {
  it('formats like YouTube-style counters', () => {
    expect(formatCompactNumber(42)).toBe('42')
    expect(formatCompactNumber(2_300)).toBe('2.3K')
    expect(formatCompactNumber(1_000_000)).toBe('1.0M')
    expect(formatCompactNumber(900_000_000_000)).toBe('900.0B')
  })
})

describe('highlightMatch', () => {
  it('returns a single plain part when query is empty', () => {
    expect(highlightMatch('Hello world', '  ')).toEqual([{ text: 'Hello world', highlight: false }])
  })

  it('highlights every case-insensitive occurrence', () => {
    expect(highlightMatch('React react REACT', 'react')).toEqual([
      { text: 'React', highlight: true },
      { text: ' ', highlight: false },
      { text: 'react', highlight: true },
      { text: ' ', highlight: false },
      { text: 'REACT', highlight: true },
    ])
  })

  it('keeps the text unhighlighted when there is no match', () => {
    expect(highlightMatch('Hello', 'xyz')).toEqual([{ text: 'Hello', highlight: false }])
  })
})
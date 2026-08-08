/**
 * In-memory LRU cache with TTL used to conserve YouTube Data API quota.
 * Stored server-side only; entries expire by wall-clock time and the cache
 * proves capacity-bounded (LRU eviction). This is a best-effort dev/local cache
 * layer on top of Next.js's own fetch caching.
 */

interface CacheEntry {
  value: unknown
  expiresAt: number
}

const DEFAULT_MAX_ENTRIES = 500

export class LRUCache {
  private readonly entries = new Map<string, CacheEntry>()
  private readonly maxEntries: number

  constructor(maxEntries: number = DEFAULT_MAX_ENTRIES) {
    this.maxEntries = maxEntries
  }

  get size(): number {
    return this.entries.size
  }

  get<T>(key: string): T | undefined {
    const entry = this.entries.get(key)
    if (!entry) return undefined
    if (Date.now() >= entry.expiresAt) {
      this.entries.delete(key)
      return undefined
    }
    // Refresh insertion order so frequently used keys are evicted last.
    this.entries.delete(key)
    this.entries.set(key, entry)
    return entry.value as T
  }

  set(key: string, value: unknown, ttlMs: number): void {
    if (ttlMs <= 0) return
    this.entries.set(key, { value, expiresAt: Date.now() + ttlMs })
    while (this.entries.size > this.maxEntries) {
      const oldest = this.entries.keys().next().value
      if (oldest === undefined) break
      this.entries.delete(oldest)
    }
  }

  has(key: string, now = Date.now()): boolean {
    const entry = this.entries.get(key)
    if (!entry) return false
    if (now >= entry.expiresAt) {
      this.entries.delete(key)
      return false
    }
    return true
  }
}

/** Process-wide cache instance shared by all server modules. */
export const apiCache = new LRUCache()

/** Runs `loader` and memoizes the result for `ttlMs`. Failed loads are never cached. */
export async function cached<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>
): Promise<T> {
  const hit = apiCache.get<T>(key)
  if (hit !== undefined) return hit
  const value = await loader()
  apiCache.set(key, value, ttlMs)
  return value
}
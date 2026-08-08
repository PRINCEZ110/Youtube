'use client'

import { useEffect, useRef } from 'react'

interface UseInfiniteScrollOptions {
  hasMore: boolean
  loading: boolean
  /** Minimum gap between automatic loads — prevents the sentinel refiring
   *  immediately after a batch is appended while still in view. */
  cooldownMs?: number
  /** Distance (px) below the viewport edge at which loading pre-triggers. */
  rootMarginOverride?: string
}

const DEFAULT_ROOT_MARGIN = '0px 0px 800px 0px'

export function useInfiniteScroll(
  callback: () => void,
  { hasMore, loading, cooldownMs = 1200, rootMarginOverride }: UseInfiniteScrollOptions
) {
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const callbackRef = useRef(callback)
  const lastFiredRef = useRef(0)

  useEffect(() => {
    callbackRef.current = callback
  })

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore || loading) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return
        const now = Date.now()
        if (now - lastFiredRef.current < cooldownMs) return
        lastFiredRef.current = now
        callbackRef.current()
      },
      { rootMargin: rootMarginOverride ?? DEFAULT_ROOT_MARGIN }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, loading, cooldownMs, rootMarginOverride])

  return sentinelRef
}
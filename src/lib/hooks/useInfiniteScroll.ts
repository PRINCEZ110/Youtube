'use client'

import { useEffect, useRef } from 'react'

interface UseInfiniteScrollOptions {
  hasMore: boolean
  loading: boolean
}

export function useInfiniteScroll(
  callback: () => void,
  { hasMore, loading }: UseInfiniteScrollOptions
) {
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  })

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore || loading) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) callbackRef.current()
    })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, loading])

  return sentinelRef
}
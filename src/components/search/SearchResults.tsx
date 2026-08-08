'use client'

import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchMoreSearch,
  fetchSearch,
  setDuration,
  setQuery,
  setSort,
  type SearchDuration,
  type SearchSort,
} from '@/store/slices/searchSlice'
import VideoCard from '@/components/video/VideoCard'
import FeedError from '@/components/ui/FeedError'
import VideoCardSkeleton from '@/components/ui/VideoCardSkeleton'
import { useInfiniteScroll } from '@/lib/hooks/useInfiniteScroll'

const SORTS: Array<{ id: SearchSort; label: string }> = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'date', label: 'Newest' },
  { id: 'views', label: 'Most viewed' },
]

const DURATIONS: Array<{ id: SearchDuration; label: string }> = [
  { id: 'any', label: 'Any duration' },
  { id: 'short', label: 'Under 4 minutes' },
  { id: 'medium', label: '4–20 minutes' },
  { id: 'long', label: 'Over 20 minutes' },
]

export default function SearchResults({ query }: { query: string }) {
  const dispatch = useAppDispatch()
  const { results, status, error, hasMore, loadingMore, totalResults, sort, duration } =
    useAppSelector((s) => s.search)

  useEffect(() => {
    dispatch(setQuery(query))
  }, [dispatch, query])

  useEffect(() => {
    dispatch(fetchSearch({ q: query, sort, duration }))
  }, [dispatch, query, sort, duration])

  const sentinelRef = useInfiniteScroll(() => {
    if (!loadingMore && hasMore && status === 'success') {
      dispatch(fetchMoreSearch())
    }
  }, { hasMore: hasMore && status === 'success', loading: loadingMore })

  const trimmed = query.trim()

  return (
    <div className="flex flex-col gap-4">
      {trimmed && status === 'success' && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {totalResults !== null
            ? `${totalResults.toLocaleString()} result${totalResults === 1 ? '' : 's'} for "${trimmed}"`
            : `Results for "${trimmed}"`}
        </p>
      )}

      {trimmed && (
        <div className="flex flex-wrap items-center gap-2">
          {SORTS.map((item) => (
            <button
              key={item.id}
              onClick={() => dispatch(setSort(item.id))}
              aria-pressed={sort === item.id}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                sort === item.id
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {trimmed && (
        <div className="flex flex-wrap items-center gap-2">
          {DURATIONS.map((item) => (
            <button
              key={item.id}
              onClick={() => dispatch(setDuration(item.id))}
              aria-pressed={duration === item.id}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                duration === item.id
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {status === 'loading' && results.length === 0 && (
        <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 6 }, (_, i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      )}

      {status === 'error' && (
        <FeedError
          error={error!}
          onRetry={() => dispatch(fetchSearch({ q: trimmed, sort, duration }))}
        />
      )}

      {status === 'success' && results.length === 0 && (
        <div className="py-16 text-center">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            No results found
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Try different keywords or check spelling for &ldquo;{query}&rdquo;.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {results.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>

      {hasMore && (
        <div ref={sentinelRef} className={`flex justify-center ${loadingMore ? '' : 'h-px'}`}>
          {loadingMore && (
            <div className="grid w-full grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {Array.from({ length: 4 }, (_, i) => (
                <VideoCardSkeleton key={i} />
              ))}
            </div>
          )}
        </div>
      )}

      {!hasMore && status === 'success' && results.length > 0 && (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-zinc-500 dark:text-zinc-400">
          <span className="h-1 w-1 rounded-full bg-zinc-400 dark:bg-zinc-600" />
          <span>No more results</span>
          <span className="h-1 w-1 rounded-full bg-zinc-400 dark:bg-zinc-600" />
        </div>
      )}
    </div>
  )
}
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { setQuery } from '@/store/slices/searchSlice'
import { mockVideos } from '@/lib/data/mockVideos'
import VideoCard from '@/components/video/VideoCard'

type SortMode = 'relevance' | 'date' | 'views'

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return text
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? <mark key={i}>{part}</mark> : part
      )}
    </>
  )
}

export default function SearchResults({ query }: { query: string }) {
  const dispatch = useAppDispatch()
  const [sort, setSort] = useState<SortMode>('relevance')

  useEffect(() => {
    dispatch(setQuery(query))
  }, [dispatch, query])

  const q = query.trim().toLowerCase()
  const results = useMemo(() => {
    const filtered = q
      ? mockVideos.filter(
          (video) =>
            video.title.toLowerCase().includes(q) ||
            video.channelName.toLowerCase().includes(q) ||
            video.description.toLowerCase().includes(q) ||
            video.tags.some((tag) => tag.toLowerCase().includes(q))
        )
      : mockVideos

    if (sort === 'date') {
      return [...filtered].sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
    }
    if (sort === 'views') {
      return [...filtered].sort((a, b) => b.views - a.views)
    }
    return filtered
  }, [q, sort])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {q ? `${results.length} result${results.length === 1 ? '' : 's'} for "${query.trim()}"` : `${results.length} videos`}
        </p>
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            aria-label="Sort results"
            className="rounded-full border border-zinc-300 bg-white px-4 py-1.5 text-sm text-zinc-700 outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300"
          >
            <option value="relevance">Relevance</option>
            <option value="date">Date</option>
            <option value="views">Views</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((video) => (
          <div key={video.id} className="flex flex-col gap-2">
            <VideoCard video={video} />
            {q && (
              <p className="line-clamp-1 text-xs text-zinc-500 dark:text-zinc-400">
                <Highlight text={video.channelName} query={q} /> · <Highlight text={video.description} query={q} />
              </p>
            )}
          </div>
        ))}
      </div>
      {results.length === 0 && (
        <p className="py-16 text-center text-zinc-500">
          No results for &ldquo;{query}&rdquo;.
        </p>
      )}
    </div>
  )
}

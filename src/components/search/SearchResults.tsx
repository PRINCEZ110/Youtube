'use client'

import { useEffect } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { setQuery } from '@/store/slices/searchSlice'
import { mockVideos } from '@/lib/data/mockVideos'
import VideoCard from '@/components/video/VideoCard'

export default function SearchResults({ query }: { query: string }) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setQuery(query))
  }, [dispatch, query])

  const q = query.trim().toLowerCase()
  const results = q
    ? mockVideos.filter(
        (video) =>
          video.title.toLowerCase().includes(q) ||
          video.channelName.toLowerCase().includes(q) ||
          video.description.toLowerCase().includes(q) ||
          video.tags.some((tag) => tag.toLowerCase().includes(q))
      )
    : mockVideos

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {q ? `${results.length} result${results.length === 1 ? '' : 's'} for "${query.trim()}"` : `${results.length} videos`}
      </p>
      <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((video) => (
          <VideoCard key={video.id} video={video} />
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
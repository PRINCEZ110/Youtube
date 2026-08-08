'use client'

import { useEffect, useState } from 'react'
import { ListVideo } from 'lucide-react'
import TopNav from '@/components/layout/TopNav'
import Sidebar from '@/components/layout/Sidebar'
import MobileNav from '@/components/layout/MobileNav'
import PlaylistCard from '@/components/ui/PlaylistCard'
import VideoCardSkeleton from '@/components/ui/VideoCardSkeleton'
import FeedError from '@/components/ui/FeedError'
import EmptyState from '@/components/ui/EmptyState'
import { usePlaylist } from '@/context/PlaylistContext'
import type { ApiError, Video } from '@/lib/youtube/types'

export default function PlaylistsPage() {
  const { playlists } = usePlaylist()
  const [covers, setCovers] = useState<Map<string, string>>(new Map())
  const [error, setError] = useState<ApiError | null>(null)

  useEffect(() => {
    if (playlists.length === 0) {
      return
    }
    let cancelled = false
    const ids = [...new Set(playlists.flatMap((p) => p.videoIds))].slice(0, 50)
    fetch(`/api/youtube/videos?mode=details&ids=${ids.join(',')}`)
      .then((res) => res.json())
      .then((body) => {
        if (cancelled) return
        const payload = body as { ok: boolean; data?: Video[]; error?: ApiError }
        if (!payload.ok || !payload.data) {
          setError(payload.error ?? { kind: 'unknown', message: 'Could not load playlists.', retryable: true })
          return
        }
        setCovers(new Map(payload.data.map((v) => [v.id, v.thumbnail])))
        setError(null)
      })
      .catch(() => {
        if (!cancelled) {
          setError({ kind: 'network', message: 'Could not load playlists.', retryable: true })
        }
      })
    return () => {
      cancelled = true
    }
  }, [playlists])

  return (
    <div className="min-h-full bg-white dark:bg-black">
      <TopNav />
      <MobileNav />
      <div className="flex">
        <Sidebar />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6">
          <h1 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Playlists
          </h1>

          {playlists.length > 0 && covers.size === 0 && !error && (
            <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {Array.from({ length: Math.min(3, playlists.length) }, (_, i) => (
                <VideoCardSkeleton key={i} />
              ))}
            </div>
          )}

          {error && <FeedError error={error} onRetry={() => setCovers(new Map())} />}

          {playlists.length === 0 ? (
            <EmptyState message="No playlists yet." icon={ListVideo} />
          ) : (
            <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {playlists.map((playlist) => (
                <PlaylistCard
                  key={playlist.id}
                  id={playlist.id}
                  name={playlist.name}
                  videoCount={playlist.videoIds.length}
                  thumbnail={playlist.videoIds.map((id) => covers.get(id)).find((t) => !!t) ?? ''}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
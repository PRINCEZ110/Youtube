'use client'

import { useState } from 'react'
import { ListVideo } from 'lucide-react'
import TopNav from '@/components/layout/TopNav'
import Sidebar from '@/components/layout/Sidebar'
import MobileNav from '@/components/layout/MobileNav'
import PlaylistCard from '@/components/ui/PlaylistCard'
import EmptyState from '@/components/ui/EmptyState'
import { mockVideos } from '@/lib/data/mockVideos'

interface StoredPlaylist {
  id: string
  name: string
  videoIds: string[]
}

function load(): StoredPlaylist[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem('playlists')
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export default function PlaylistsPage() {
  const [playlists] = useState<StoredPlaylist[]>(() => load())

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

          {playlists.length === 0 ? (
            <EmptyState message="No playlists yet." icon={ListVideo} />
          ) : (
            <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {playlists.map((playlist) => {
                const first = mockVideos.find((v) => v.id === playlist.videoIds[0])
                return (
                  <PlaylistCard
                    key={playlist.id}
                    id={playlist.id}
                    name={playlist.name}
                    videoCount={playlist.videoIds.length}
                    thumbnail={first?.thumbnail ?? mockVideos[0].thumbnail}
                  />
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

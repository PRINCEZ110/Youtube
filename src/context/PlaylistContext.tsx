'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export interface Playlist {
  id: string
  name: string
  videoIds: string[]
}

interface PlaylistContextValue {
  playlists: Playlist[]
  createPlaylist: (name: string) => void
  addToPlaylist: (playlistId: string, videoId: string) => void
  removeFromPlaylist: (playlistId: string, videoId: string) => void
}

const PlaylistContext = createContext<PlaylistContextValue | undefined>(undefined)

function load(): Playlist[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem('playlists')
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function PlaylistProvider({ children }: { children: React.ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>(() => load())

  useEffect(() => {
    localStorage.setItem('playlists', JSON.stringify(playlists))
  }, [playlists])

  function createPlaylist(name: string) {
    const trimmed = name.trim()
    if (!trimmed) return
    setPlaylists((prev) => [...prev, { id: `p-${Date.now()}`, name: trimmed, videoIds: [] }])
  }

  function addToPlaylist(playlistId: string, videoId: string) {
    setPlaylists((prev) =>
      prev.map((playlist) =>
        playlist.id === playlistId && !playlist.videoIds.includes(videoId)
          ? { ...playlist, videoIds: [...playlist.videoIds, videoId] }
          : playlist
      )
    )
  }

  function removeFromPlaylist(playlistId: string, videoId: string) {
    setPlaylists((prev) =>
      prev.map((playlist) =>
        playlist.id === playlistId
          ? { ...playlist, videoIds: playlist.videoIds.filter((id) => id !== videoId) }
          : playlist
      )
    )
  }

  return (
    <PlaylistContext.Provider value={{ playlists, createPlaylist, addToPlaylist, removeFromPlaylist }}>
      {children}
    </PlaylistContext.Provider>
  )
}

export function usePlaylist() {
  const context = useContext(PlaylistContext)
  if (!context) {
    throw new Error('usePlaylist must be used within a PlaylistProvider')
  }
  return context
}
'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface PlaybackEntry {
  p: number
  t: number
}

type PlaybackStore = Record<string, PlaybackEntry>

interface PlaybackContextValue {
  position: number
  setPosition: (id: string, seconds: number) => void
  getPosition: (id: string) => number
  getPositions: () => PlaybackStore
}

const PlaybackContext = createContext<PlaybackContextValue | undefined>(undefined)

const KEY = 'playback'

function load(): PlaybackStore {
  if (typeof window === 'undefined') return {}
  try {
    const data = localStorage.getItem(KEY)
    if (!data) return {}
    const parsed = JSON.parse(data) as Record<string, unknown>
    const store: PlaybackStore = {}
    for (const [id, value] of Object.entries(parsed)) {
      if (value && typeof value === 'object' && 'p' in value) {
        const entry = value as PlaybackEntry
        if (typeof entry.p === 'number') {
          store[id] = { p: entry.p, t: typeof entry.t === 'number' ? entry.t : 0 }
        }
      } else if (typeof value === 'number') {
        store[id] = { p: value, t: 0 }
      }
    }
    return store
  } catch {
    return {}
  }
}

export function PlaybackProvider({ children }: { children: React.ReactNode }) {
  const [positions, setPositions] = useState<PlaybackStore>(() => load())
  const [position, setPositionValue] = useState(0)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(positions))
  }, [positions])

  function setPosition(id: string, seconds: number) {
    setPositions((prev) => ({ ...prev, [id]: { p: seconds, t: Date.now() } }))
    setPositionValue(seconds)
  }

  function getPosition(id: string) {
    return positions[id]?.p ?? 0
  }

  function getPositions() {
    return positions
  }

  return (
    <PlaybackContext.Provider value={{ position, setPosition, getPosition, getPositions }}>
      {children}
    </PlaybackContext.Provider>
  )
}

export function usePlayback() {
  const context = useContext(PlaybackContext)
  if (!context) {
    throw new Error('usePlayback must be used within a PlaybackProvider')
  }
  return context
}
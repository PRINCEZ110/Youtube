'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface PlaybackContextValue {
  position: number
  setPosition: (id: string, seconds: number) => void
  getPosition: (id: string) => number
}

const PlaybackContext = createContext<PlaybackContextValue | undefined>(undefined)

function load(): Record<string, number> {
  if (typeof window === 'undefined') return {}
  try {
    const data = localStorage.getItem('playback')
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

export function PlaybackProvider({ children }: { children: React.ReactNode }) {
  const [positions, setPositions] = useState<Record<string, number>>(() => load())
  const [position, setPositionValue] = useState(0)

  useEffect(() => {
    localStorage.setItem('playback', JSON.stringify(positions))
  }, [positions])

  function setPosition(id: string, seconds: number) {
    setPositions((prev) => ({ ...prev, [id]: seconds }))
    setPositionValue(seconds)
  }

  function getPosition(id: string) {
    return positions[id] ?? 0
  }

  return (
    <PlaybackContext.Provider value={{ position, setPosition, getPosition }}>
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
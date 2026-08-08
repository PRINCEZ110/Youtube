'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface FeedPrefs {
  videos: string[]
  channels: string[]
}

interface FeedPrefsContextValue extends FeedPrefs {
  dismissVideo: (id: string) => void
  dismissChannel: (id: string) => void
}

const FeedPrefsContext = createContext<FeedPrefsContextValue | undefined>(undefined)

const KEY = 'feedPrefs'

function load(): FeedPrefs {
  if (typeof window === 'undefined') return { videos: [], channels: [] }
  try {
    const data = localStorage.getItem(KEY)
    return data ? (JSON.parse(data) as FeedPrefs) : { videos: [], channels: [] }
  } catch {
    return { videos: [], channels: [] }
  }
}

export function FeedPrefsProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<FeedPrefs>(() => load())

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(prefs))
  }, [prefs])

  function dismissVideo(id: string) {
    setPrefs((prev) =>
      prev.videos.includes(id) ? prev : { ...prev, videos: [...prev.videos, id] }
    )
  }

  function dismissChannel(channelId: string) {
    setPrefs((prev) =>
      prev.channels.includes(channelId)
        ? prev
        : { ...prev, channels: [...prev.channels, channelId] }
    )
  }

  return (
    <FeedPrefsContext.Provider value={{ ...prefs, dismissVideo, dismissChannel }}>
      {children}
    </FeedPrefsContext.Provider>
  )
}

export function useFeedPrefs() {
  const context = useContext(FeedPrefsContext)
  if (!context) {
    throw new Error('useFeedPrefs must be used within a FeedPrefsProvider')
  }
  return context
}
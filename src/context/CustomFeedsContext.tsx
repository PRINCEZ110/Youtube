'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export interface CustomFeed {
  id: string
  name: string
  query: string
  createdAt: number
}

interface CustomFeedsContextValue {
  feeds: CustomFeed[]
  addFeed: (name: string, query: string) => CustomFeed
  removeFeed: (id: string) => void
}

const CustomFeedsContext = createContext<CustomFeedsContextValue | undefined>(undefined)

const KEY = 'customFeeds'

function load(): CustomFeed[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(KEY)
    return data ? (JSON.parse(data) as CustomFeed[]) : []
  } catch {
    return []
  }
}

function newId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `feed-${Date.now().toString(36)}`
}

export function CustomFeedsProvider({ children }: { children: React.ReactNode }) {
  const [feeds, setFeeds] = useState<CustomFeed[]>(() => load())

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(feeds))
  }, [feeds])

  function addFeed(name: string, query: string) {
    const feed: CustomFeed = {
      id: newId(),
      name: name.trim() || query.trim(),
      query: query.trim(),
      createdAt: Date.now(),
    }
    setFeeds((prev) => [feed, ...prev])
    return feed
  }

  function removeFeed(id: string) {
    setFeeds((prev) => prev.filter((feed) => feed.id !== id))
  }

  return (
    <CustomFeedsContext.Provider value={{ feeds, addFeed, removeFeed }}>
      {children}
    </CustomFeedsContext.Provider>
  )
}

export function useCustomFeeds() {
  const context = useContext(CustomFeedsContext)
  if (!context) {
    throw new Error('useCustomFeeds must be used within a CustomFeedsProvider')
  }
  return context
}
'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface WatchLaterContextValue {
  saved: string[]
  add: (id: string) => void
  remove: (id: string) => void
}

const WatchLaterContext = createContext<WatchLaterContextValue | undefined>(undefined)

function load(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem('watchLater')
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function WatchLaterProvider({ children }: { children: React.ReactNode }) {
  const [saved, setSaved] = useState<string[]>(() => load())

  useEffect(() => {
    localStorage.setItem('watchLater', JSON.stringify(saved))
  }, [saved])

  function add(id: string) {
    if (!saved.includes(id)) setSaved([...saved, id])
  }

  function remove(id: string) {
    setSaved(saved.filter((v) => v !== id))
  }

  return (
    <WatchLaterContext.Provider value={{ saved, add, remove }}>
      {children}
    </WatchLaterContext.Provider>
  )
}

export function useWatchLater() {
  const context = useContext(WatchLaterContext)
  if (!context) {
    throw new Error('useWatchLater must be used within a WatchLaterProvider')
  }
  return context
}

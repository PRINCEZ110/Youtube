'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const WatchLaterContext = createContext<any>(null)

function load() {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem('watchLater')
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function WatchLaterProvider({ children }: { children: React.ReactNode }) {
  const [saved, setSaved] = useState<string[]>([])

  useEffect(() => {
    setSaved(load())
  }, [])

  useEffect(() => {
    localStorage.setItem('watchLater', JSON.stringify(saved))
  }, [saved])

  function add(id: string) {
    if (!saved.includes(id)) setSaved([...saved, id])
  }

  function remove(id: string) {
    setSaved(saved.filter((v: string) => v !== id))
  }

  return (
    <WatchLaterContext.Provider value={{ saved, add, remove }}>
      {children}
    </WatchLaterContext.Provider>
  )
}

export function useWatchLater() {
  return useContext(WatchLaterContext)
}

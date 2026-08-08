'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

export interface HistoryEntry {
  id: string
  watchedAt: string
}

interface HistoryContextValue {
  entries: HistoryEntry[]
  record: (videoId: string) => void
  remove: (videoId: string) => void
  clear: () => void
}

const HistoryContext = createContext<HistoryContextValue | undefined>(undefined)

const HISTORY_KEY = 'watchHistory'
const MAX_ENTRIES = 500

function load(): HistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(HISTORY_KEY)
    const parsed = data ? (JSON.parse(data) as unknown) : []
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((entry): entry is HistoryEntry =>
        Boolean(entry) && typeof (entry as HistoryEntry).id === 'string'
      )
      .slice(0, MAX_ENTRIES)
  } catch {
    return []
  }
}

/** Pure helper shared with the /history page for consistent list handling. */
export function mergeHistory(existing: HistoryEntry[], videoId: string): HistoryEntry[] {
  const entry: HistoryEntry = { id: videoId, watchedAt: new Date().toISOString() }
  return [entry, ...existing.filter((e) => e.id !== videoId)].slice(0, MAX_ENTRIES)
}

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<HistoryEntry[]>(load)

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(entries))
    } catch {
      // localStorage full or unavailable — history is best-effort.
    }
  }, [entries])

  const record = useCallback((videoId: string) => {
    if (!videoId) return
    setEntries((prev) => mergeHistory(prev, videoId))
  }, [])

  const remove = useCallback((videoId: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== videoId))
  }, [])

  const clear = useCallback(() => {
    setEntries([])
  }, [])

  return (
    <HistoryContext.Provider value={{ entries, record, remove, clear }}>
      {children}
    </HistoryContext.Provider>
  )
}

export function useHistory() {
  const context = useContext(HistoryContext)
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider')
  }
  return context
}

export { HISTORY_KEY }
'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface HistoryContextValue {
  history: string[]
  addHistory: (id: string) => void
  clearHistory: () => void
}

const HistoryContext = createContext<HistoryContextValue | undefined>(undefined)

function load(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem('history')
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<string[]>(() => load())
  const pathname = usePathname()

  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(history))
  }, [history])

  const watchedId = pathname?.match(/^\/watch\/([^/]+)/)?.[1]
  if (watchedId && !history.includes(watchedId)) {
    setHistory([watchedId, ...history])
  }

  const addHistory = useCallback((id: string) => {
    setHistory((prev) => (prev.includes(id) ? prev : [id, ...prev]))
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  return (
    <HistoryContext.Provider value={{ history, addHistory, clearHistory }}>
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

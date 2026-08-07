'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface LikedContextValue {
  liked: string[]
  toggleLike: (id: string) => void
  isLiked: (id: string) => boolean
}

const LikedContext = createContext<LikedContextValue | undefined>(undefined)

function load(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem('likedVideos')
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function LikedProvider({ children }: { children: React.ReactNode }) {
  const [liked, setLiked] = useState<string[]>(() => load())

  useEffect(() => {
    localStorage.setItem('likedVideos', JSON.stringify(liked))
  }, [liked])

  function toggleLike(id: string) {
    setLiked((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  function isLiked(id: string) {
    return liked.includes(id)
  }

  return (
    <LikedContext.Provider value={{ liked, toggleLike, isLiked }}>
      {children}
    </LikedContext.Provider>
  )
}

export function useLiked() {
  const context = useContext(LikedContext)
  if (!context) {
    throw new Error('useLiked must be used within a LikedProvider')
  }
  return context
}
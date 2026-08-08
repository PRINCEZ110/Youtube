'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface SubscriptionsContextValue {
  subscriptions: string[]
  toggleSubscription: (channelId: string) => void
  isSubscribed: (channelId: string) => boolean
}

const SubscriptionsContext = createContext<SubscriptionsContextValue | undefined>(undefined)

function load(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem('subscriptions')
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function SubscriptionsProvider({ children }: { children: React.ReactNode }) {
  const [subscriptions, setSubscriptions] = useState<string[]>(() => load())

  useEffect(() => {
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions))
  }, [subscriptions])

  function toggleSubscription(channelId: string) {
    if (!channelId) return
    setSubscriptions((prev) =>
      prev.includes(channelId) ? prev.filter((id) => id !== channelId) : [...prev, channelId]
    )
  }

  function isSubscribed(channelId: string) {
    return subscriptions.includes(channelId)
  }

  return (
    <SubscriptionsContext.Provider value={{ subscriptions, toggleSubscription, isSubscribed }}>
      {children}
    </SubscriptionsContext.Provider>
  )
}

export function useSubscriptions() {
  const context = useContext(SubscriptionsContext)
  if (!context) {
    throw new Error('useSubscriptions must be used within a SubscriptionsProvider')
  }
  return context
}
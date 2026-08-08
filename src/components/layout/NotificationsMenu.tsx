'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell, Check } from 'lucide-react'

interface NotificationItem {
  id: string
  text: string
  time: string
  read: boolean
}

const KEY = 'notifications'

const SEED: NotificationItem[] = [
  {
    id: 'n1',
    text: 'New video from Lofi Girl: "lofi hip hop radio 📚 beats to relax/study to"',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 'n2',
    text: 'The channel you subscribed to just posted: "New uploads are ready"',
    time: 'Yesterday',
    read: false,
  },
  {
    id: 'n3',
    text: 'Your comment received a reply — "Nice video!"',
    time: '2 days ago',
    read: true,
  },
]

function load(): NotificationItem[] {
  if (typeof window === 'undefined') return SEED
  try {
    const data = localStorage.getItem(KEY)
    return data ? (JSON.parse(data) as NotificationItem[]) : SEED
  } catch {
    return SEED
  }
}

export default function NotificationsMenu() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<NotificationItem[]>(SEED)
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    Promise.resolve().then(() => setItems(load()))
  }, [])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const unread = items.filter((n) => !n.read).length

  function markAllRead() {
    const next = items.map((n) => ({ ...n, read: true }))
    setItems(next)
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      // ignore
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications${unread ? ` (${unread} unread)` : ''}`}
        aria-expanded={open}
        className="relative rounded-full p-2 text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
      >
        <Bell size={24} />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute top-full right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Notifications</p>
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  <Check size={13} />
                  Mark all read
                </button>
              )}
            </div>
            <ul className="max-h-80 overflow-y-auto">
              {items.map((item) => (
                <li
                  key={item.id}
                  className={`flex gap-3 border-b border-zinc-100 px-4 py-3 text-sm last:border-0 dark:border-zinc-900 ${
                    item.read ? '' : 'bg-zinc-50 dark:bg-zinc-900/60'
                  }`}
                >
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-600" aria-hidden={item.read} />
                  <div className="min-w-0">
                    <p className="text-zinc-800 dark:text-zinc-200">{item.text}</p>
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{item.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
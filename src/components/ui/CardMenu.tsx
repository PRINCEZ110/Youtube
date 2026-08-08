'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Clock, Link, Share2, UserX, X } from 'lucide-react'
import { useFeedPrefs } from '@/context/FeedPrefsContext'
import { useWatchLater } from '@/context/WatchLaterContext'
import type { Video } from '@/lib/youtube/types'

/** Three-dot card menu: save to watch later, share, and tune the feed locally. */
export default function CardMenu({
  video,
  align = 'left',
}: {
  video: Video
  align?: 'left' | 'right'
}) {
  const [open, setOpen] = useState(false)
  const [shared, setShared] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const { saved, add, remove } = useWatchLater()
  const { dismissVideo, dismissChannel } = useFeedPrefs()

  const isSaved = saved.includes(video.id)

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: MouseEvent | TouchEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  async function share() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/watch/${video.id}`)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    } catch {
      // Clipboard unavailable.
    }
    setOpen(false)
  }

  function close(action: () => void) {
    action()
    setOpen(false)
  }

  const itemClass =
    'flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800'

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation()
          setOpen((o) => !o)
        }}
        aria-label={`More actions for ${video.title}`}
        aria-expanded={open}
        className="rounded-full p-2 text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <MoreHorizontalIcon />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" aria-hidden />
          <div
            role="menu"
            className={`absolute top-9 z-50 w-60 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 ${
              align === 'right' ? 'right-0' : 'left-0'
            }`}
          >
            <button
              role="menuitem"
              onClick={() => close(() => (isSaved ? remove(video.id) : add(video.id)))}
              className={itemClass}
            >
              {isSaved ? <X size={18} /> : <Clock size={18} />}
              {isSaved ? 'Remove from Watch Later' : 'Save to Watch Later'}
            </button>
            <button role="menuitem" onClick={share} className={itemClass}>
              {shared ? <Check size={18} /> : <Share2 size={18} />}
              {shared ? 'Link copied' : 'Share'}
            </button>
            <div className="my-1 h-px bg-zinc-200 dark:bg-zinc-800" />
            <button
              role="menuitem"
              onClick={() => close(() => dismissVideo(video.id))}
              className={itemClass}
            >
              <Link size={18} />
              Not interested
            </button>
            <button
              role="menuitem"
              onClick={() => close(() => dismissChannel(video.channelId))}
              className={itemClass}
            >
              <UserX size={18} />
              Don&apos;t recommend channel
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function MoreHorizontalIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </svg>
  )
}
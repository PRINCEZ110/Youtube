'use client'

import { Clock } from 'lucide-react'
import { useWatchLater } from '@/context/WatchLaterContext'

export default function WatchLaterButton({ videoId }: { videoId: string }) {
  const { saved, add, remove } = useWatchLater()
  const isSaved = saved.includes(videoId)

  function toggle() {
    if (isSaved) {
      remove(videoId)
    } else {
      add(videoId)
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={isSaved ? 'Remove from Watch Later' : 'Add to Watch Later'}
      className="rounded-full p-2 transition-colors hover:bg-zinc-800"
    >
      <Clock
        size={24}
        className={isSaved ? 'text-zinc-100' : 'text-zinc-400'}
        fill={isSaved ? 'currentColor' : 'none'}
      />
    </button>
  )
}

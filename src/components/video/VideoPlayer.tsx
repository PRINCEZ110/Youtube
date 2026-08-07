'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'
import type { Video } from '@/lib/data/mockVideos'

export default function VideoPlayer({ video }: { video: Video }) {
  const [ready, setReady] = useState(false)

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
      <video
        controls
        preload="metadata"
        poster={video.thumbnail}
        src="https://www.w3schools.com/html/mov_bbb.mp4"
        className="aspect-video w-full bg-black"
        onLoadedMetadata={() => setReady(true)}
      />
      {!ready && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/60 text-white">
            <Play size={28} className="ml-1 fill-current" />
          </span>
        </div>
      )}
    </div>
  )
}

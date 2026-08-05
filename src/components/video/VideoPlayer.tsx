'use client'

import Image from 'next/image'
import { Play } from 'lucide-react'
import { formatDuration } from '@/lib/utils'
import type { Video } from '@/lib/data/mockVideos'

export default function VideoPlayer({ video }: { video: Video }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
      <Image
        src={video.thumbnail}
        alt={video.title}
        fill
        priority
        sizes="(max-width: 1600px) 100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-red-600">
          <Play size={28} className="ml-1 fill-current" />
        </span>
      </div>
      <span className="absolute right-3 bottom-3 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
        {formatDuration(video.duration)}
      </span>
    </div>
  )
}
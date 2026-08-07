'use client'

import type { Video } from '@/lib/data/mockVideos'

export default function VideoPlayer({ video }: { video: Video }) {
  return (
    <video
      controls
      preload="metadata"
      poster={video.thumbnail}
      src="https://www.w3schools.com/html/mov_bbb.mp4"
      className="aspect-video w-full bg-black"
    />
  )
}
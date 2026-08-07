'use client'

import VideoCard from '@/components/video/VideoCard'
import type { Video } from '@/lib/data/mockVideos'

export default function ChannelVideos({ videos }: { videos: Video[] }) {
  if (videos.length === 0) {
    return <p className="py-12 text-center text-zinc-500">No videos yet.</p>
  }

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  )
}

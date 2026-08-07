'use client'

import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { clearCurrentVideo, setCurrentVideo } from '@/store/slices/videoSlice'
import VideoPlayer from '@/components/video/VideoPlayer'
import VideoInfo from '@/components/video/VideoInfo'
import RelatedVideos from '@/components/video/RelatedVideos'
import CommentSection from '@/components/video/CommentSection'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function WatchPageClient({ id }: { id: string }) {
  const dispatch = useAppDispatch()
  const { currentVideo, relatedVideos } = useAppSelector((s) => s.videos)

  useEffect(() => {
    dispatch(setCurrentVideo(id))
    return () => {
      dispatch(clearCurrentVideo())
    }
  }, [dispatch, id])

  if (!currentVideo) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size={40} />
      </div>
    )
  }

  return (
    <main className="mx-auto flex max-w-[1600px] gap-6 px-4 py-6">
      <div className="min-w-0 flex-1">
        <VideoPlayer video={currentVideo} />
        <VideoInfo video={currentVideo} />
        <CommentSection videoId={currentVideo.id} />
        {relatedVideos.length > 0 && (
          <div className="mt-6 lg:hidden">
            <RelatedVideos />
          </div>
        )}
      </div>
      <aside className="hidden w-96 shrink-0 lg:block">
        <RelatedVideos />
      </aside>
    </main>
  )
}

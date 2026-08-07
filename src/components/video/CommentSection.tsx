'use client'

import { useState } from 'react'
import { ThumbsUp } from 'lucide-react'
import ChannelAvatar from '@/components/ui/ChannelAvatar'
import { timeAgo } from '@/lib/utils'
import { mockComments } from '@/lib/data/mockComments'
import type { Comment } from '@/lib/data/mockComments'

const avatarUrl = (seed: number) => `https://picsum.photos/seed/${seed}/48/48`

function loadComments(videoId: string): Comment[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(`comments-${videoId}`)
    if (!data) return []
    const parsed = JSON.parse(data) as Comment[]
    return parsed.map((c) => ({ ...c, timestamp: new Date(c.timestamp) }))
  } catch {
    return []
  }
}

export default function CommentSection({ videoId }: { videoId: string }) {
  const [userComments, setUserComments] = useState<Comment[]>(() => loadComments(videoId))
  const [draft, setDraft] = useState('')

  const comments = [
    ...userComments,
    ...mockComments.filter((c) => c.videoId === videoId),
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  function handleSubmit() {
    const text = draft.trim()
    if (!text) return
    const comment: Comment = {
      id: `c-${Date.now()}`,
      videoId: videoId,
      authorName: 'You',
      authorAvatar: avatarUrl(999),
      text,
      likes: 0,
      timestamp: new Date(),
      replies: [],
    }
    const next = [comment, ...userComments]
    setUserComments(next)
    localStorage.setItem(`comments-${videoId}`, JSON.stringify(next))
    setDraft('')
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {comments.length} Comments
      </h2>

      <div className="flex gap-3">
        <ChannelAvatar name="You" avatarUrl={avatarUrl(999)} size={40} />
        <div className="flex flex-1 flex-col gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a comment..."
            rows={2}
            className="w-full resize-none rounded-lg border border-zinc-300 bg-transparent p-3 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:text-zinc-100 dark:focus:border-zinc-400"
          />
          <button
            onClick={handleSubmit}
            disabled={!draft.trim()}
            className="self-end rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Comment
          </button>
        </div>
      </div>

      {comments.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <ul className="flex flex-col gap-5">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-3">
              <ChannelAvatar
                name={comment.authorName}
                avatarUrl={comment.authorAvatar}
                size={40}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {comment.authorName}
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {timeAgo(comment.timestamp)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{comment.text}</p>
                <div className="mt-2 flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                  <ThumbsUp size={16} />
                  <span>{comment.likes}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
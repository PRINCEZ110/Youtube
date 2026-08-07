'use client'

import { useState } from 'react'
import { ThumbsUp } from 'lucide-react'
import ChannelAvatar from '@/components/ui/ChannelAvatar'
import { timeAgo } from '@/lib/utils'

const AUTHORS = ['Salomi', 'Prince', 'Alex', 'Maya', 'Jordan', 'Priya', 'Lucas', 'Sofia']
const BODIES = [
  'Great video, really well explained!',
  'This helped me a lot, thanks for sharing.',
  'Would love to see a part two!',
  'The editing is so clean and professional.',
  'Subscribed! Keep up the amazing work.',
  'I was waiting for this one, worth it.',
  'Clear and concise as always.',
  'Nice thumbnail and even better content.',
]

function commentsFor(id: string) {
  const now = Date.now()
  return Array.from({ length: 5 }, (_, i) => {
    const seed = (id.charCodeAt(id.length - 1) || 0) + i
    return {
      id: `${id}-c${i}`,
      author: AUTHORS[seed % AUTHORS.length],
      body: BODIES[(seed * 3) % BODIES.length],
      likes: (seed * 7) % 40,
      minutesAgo: seed * 37 + 5,
      createdAt: now - (seed * 37 + 5) * 60_000,
    }
  })
}

export default function CommentsSection({ videoId }: { videoId: string }) {
  const [comments, setComments] = useState(() => commentsFor(videoId))
  const [draft, setDraft] = useState('')

  function post() {
    const body = draft.trim()
    if (!body) return
    setComments((prev) => [
      { id: `${videoId}-c-new`, author: 'You', body, likes: 0, minutesAgo: 0, createdAt: Date.now() },
      ...prev,
    ])
    setDraft('')
  }

  return (
    <section className="flex flex-col gap-4 py-4" aria-label="Comments">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
      </h2>

      <div className="flex gap-3">
        <ChannelAvatar name="You" size={36} />
        <div className="flex flex-1 flex-col gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a comment..."
            rows={2}
            className="w-full resize-none rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-600 dark:border-zinc-700 dark:text-zinc-100"
          />
          <div className="flex justify-end">
            <button
              onClick={post}
              disabled={!draft.trim()}
              className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 disabled:opacity-50 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Comment
            </button>
          </div>
        </div>
      </div>

      {comments.length === 0 ? (
        <p className="py-12 text-center text-zinc-500">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <ul className="flex flex-col gap-5">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-3">
              <ChannelAvatar name={comment.author} size={36} />
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {comment.author}
                  </span>
                  <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {timeAgo(new Date(comment.createdAt))}
                  </span>
                </p>
                <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                  {comment.body}
                </p>
                <div className="mt-1.5 flex items-center gap-1">
                  <button
                    aria-label="Like comment"
                    className="rounded-full p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                  >
                    <ThumbsUp size={15} />
                  </button>
                  {comment.likes > 0 && (
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {comment.likes}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

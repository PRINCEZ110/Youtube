'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowUpWideNarrow, SendHorizontal, ThumbsUp } from 'lucide-react'
import ChannelAvatar from '@/components/ui/ChannelAvatar'
import { timeAgo } from '@/lib/utils'
import FeedError from '@/components/ui/FeedError'
import type { ApiError, Comment, PageResponse } from '@/lib/youtube/types'

type Sort = 'relevance' | 'time'

interface LocalComment {
  id: string
  author: string
  text: string
  publishedAt: string
}

const SORTS: Array<{ id: Sort; label: string }> = [
  { id: 'relevance', label: 'Top' },
  { id: 'time', label: 'Newest' },
]

const LOCAL_KEY = 'localComments'

function loadLocal(videoId: string): LocalComment[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(LOCAL_KEY)
    const map = data ? (JSON.parse(data) as Record<string, LocalComment[]>) : {}
    return map[videoId] ?? []
  } catch {
    return []
  }
}

export default function CommentSection({
  videoId,
  initialComments,
  initialNextPageToken,
  initialError,
}: {
  videoId: string
  initialComments: Comment[]
  initialNextPageToken?: string | null
  initialError?: ApiError | null
}) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [nextPageToken, setNextPageToken] = useState<string | null>(
    initialNextPageToken ?? null
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(initialError ?? null)
  const [sort, setSort] = useState<Sort>('relevance')
  const [local, setLocal] = useState<LocalComment[]>([])
  const [draft, setDraft] = useState('')

  useEffect(() => {
    Promise.resolve().then(() => setLocal(loadLocal(videoId)))
  }, [videoId])

  const localComments = useMemo(
    () => local.map((c) => ({ id: c.id, authorName: c.author, authorAvatar: '', authorChannelId: null, text: c.text, publishedAt: c.publishedAt, likes: 0, replies: [] as Comment[] })),
    [local]
  )

  function saveLocal(next: LocalComment[]) {
    setLocal(next)
    try {
      const map = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '{}') as Record<
        string,
        LocalComment[]
      >
      map[videoId] = next
      localStorage.setItem(LOCAL_KEY, JSON.stringify(map))
    } catch {
      // localStorage unavailable — keep in-memory only
    }
  }

  function appendComment() {
    const text = draft.trim()
    if (!text) return
    const comment: LocalComment = {
      id: `local-${Date.now().toString(36)}`,
      author: 'You',
      text,
      publishedAt: new Date().toISOString(),
    }
    saveLocal([comment, ...local])
    setDraft('')
  }

  async function loadMore() {
    if (!nextPageToken || loading) return
    setLoading(true)
    try {
      const res = await fetch(
        `/api/youtube/comments?videoId=${videoId}&pageToken=${nextPageToken}&order=${sort}`
      )
      const body = (await res.json()) as {
        ok: boolean
        data?: PageResponse<Comment>
        error?: ApiError
      }
      if (!body.ok || !body.data) {
        setError(body.error ?? { kind: 'unknown', message: 'Comments failed to load', retryable: true })
        return
      }
      const existing = new Set(comments.map((c) => c.id))
      setComments((prev) => [...prev, ...body.data!.items.filter((c) => !existing.has(c.id))])
      setNextPageToken(body.data.nextPageToken)
    } catch {
      setError({ kind: 'network', message: 'Could not load more comments.', retryable: true })
    } finally {
      setLoading(false)
    }
  }

  function changeSort(next: Sort) {
    if (next === sort) return
    setSort(next)
    setComments([])
    setNextPageToken(null)
    setError(null)
    fetch(`/api/youtube/comments?videoId=${videoId}&order=${next}`)
      .then((res) => res.json())
      .then((body) => {
        const payload = body as {
          ok: boolean
          data?: PageResponse<Comment>
          error?: ApiError
        }
        if (!payload.ok || !payload.data) {
          setError(payload.error ?? { kind: 'unknown', message: 'Comments failed to load', retryable: true })
          return
        }
        setComments(payload.data!.items)
        setNextPageToken(payload.data.nextPageToken)
      })
      .catch(() => {
        setError({ kind: 'network', message: 'Could not load comments.', retryable: true })
      })
  }

  if (error && comments.length === 0 && localComments.length === 0) {
    return (
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Comments</h2>
        <FeedError error={error} onRetry={loadMore} compact />
      </section>
    )
  }

  const total = comments.length + localComments.length

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {total} Comment{total === 1 ? '' : 's'}
      </h2>

      <div className="flex items-center gap-1">
        <ArrowUpWideNarrow size={18} className="mr-1 text-zinc-600 dark:text-zinc-400" />
        {SORTS.map((item) => (
          <button
            key={item.id}
            onClick={() => changeSort(item.id)}
            aria-pressed={sort === item.id}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              sort === item.id
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mb-2 flex gap-3">
        <ChannelAvatar name="You" size={40} />
        <div className="min-w-0 flex-1 border-b border-zinc-200 pb-2 dark:border-zinc-800">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') appendComment()
            }}
            placeholder="Add a comment…"
            aria-label="Add a comment"
            className="w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-500 dark:text-zinc-100"
          />
          {draft.trim() && (
            <button
              onClick={appendComment}
              aria-label="Post comment"
              className="mt-2 flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              <SendHorizontal size={15} />
              Comment
            </button>
          )}
        </div>
      </div>

      {total === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">No comments yet on this video.</p>
      ) : (
        <ul className="flex flex-col gap-5">
          {localComments.map((comment) => (
            <li key={comment.id} className="flex flex-col gap-3">
              <div className="flex gap-3">
                <ChannelAvatar name="You" size={40} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">You</span>
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {timeAgo(comment.publishedAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{comment.text}</p>
                </div>
              </div>
            </li>
          ))}

          {comments.map((comment) => (
            <li key={comment.id} className="flex flex-col gap-3">
              <div className="flex gap-3">
                <ChannelAvatar
                  name={comment.authorName}
                  avatarUrl={comment.authorAvatar}
                  size={40}
                  channelId={comment.authorChannelId || undefined}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Link
                      href={
                        comment.authorChannelId
                          ? `/channel/${comment.authorChannelId}`
                          : '#'
                      }
                      className="font-medium text-zinc-900 hover:underline dark:text-zinc-100"
                      onClick={(e) => {
                        if (!comment.authorChannelId) e.preventDefault()
                      }}
                    >
                      {comment.authorName}
                    </Link>
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {timeAgo(comment.publishedAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{comment.text}</p>
                  {comment.likes > 0 && (
                    <div className="mt-2 flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                      <ThumbsUp size={16} />
                      <span>{comment.likes}</span>
                    </div>
                  )}
                </div>
              </div>
              {comment.replies.length > 0 && (
                <ul className="ml-13 flex flex-col gap-4 border-l border-zinc-200 pl-6 dark:border-zinc-800">
                  {comment.replies.map((reply) => (
                    <li key={reply.id} className="flex gap-3">
                      <ChannelAvatar
                        name={reply.authorName}
                        avatarUrl={reply.authorAvatar}
                        size={36}
                        channelId={reply.authorChannelId || undefined}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Link
                            href={reply.authorChannelId ? `/channel/${reply.authorChannelId}` : '#'}
                            className="font-medium text-zinc-900 hover:underline dark:text-zinc-100"
                            onClick={(e) => {
                              if (!reply.authorChannelId) e.preventDefault()
                            }}
                          >
                            {reply.authorName}
                          </Link>
                          <span className="text-zinc-500 dark:text-zinc-400">
                            {timeAgo(reply.publishedAt)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{reply.text}</p>
                        {reply.likes > 0 && (
                          <div className="mt-2 flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                            <ThumbsUp size={16} />
                            <span>{reply.likes}</span>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}

      {nextPageToken && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="self-start rounded-full bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 disabled:opacity-50 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          {loading ? 'Loading…' : 'Show more comments'}
        </button>
      )}
    </section>
  )
}
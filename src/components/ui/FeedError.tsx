'use client'

import { AlertTriangle, KeyRound, RefreshCw, WifiOff } from 'lucide-react'
import type { ApiError } from '@/lib/youtube/types'

const KIND_META: Record<
  ApiError['kind'],
  { title: string; description: string; icon: typeof AlertTriangle }
> = {
  'missing-key': {
    title: 'YouTube API key missing',
    description:
      'Set YOUTUBE_API_KEY in your .env file (see .env.example) to load real YouTube content.',
    icon: KeyRound,
  },
  'quota-exceeded': {
    title: 'YouTube API quota exceeded',
    description:
      'The daily quota for this API key has been used up. Data is cached, but new requests will fail until the quota resets or a new key is added.',
    icon: AlertTriangle,
  },
  'rate-limit': {
    title: 'Too many requests',
    description: 'The YouTube API is throttling requests right now. Give it a moment and retry.',
    icon: RefreshCw,
  },
  'network': {
    title: 'Network error',
    description: 'Could not reach the YouTube API. Check your connection and try again.',
    icon: WifiOff,
  },
  'not-found': {
    title: 'Not found',
    description: 'The requested content does not exist or was removed from YouTube.',
    icon: AlertTriangle,
  },
  'invalid': {
    title: 'Request invalid',
    description: 'Something went wrong with this request to YouTube.',
    icon: AlertTriangle,
  },
  'unknown': {
    title: 'Something went wrong',
    description: 'An unexpected error occurred while loading YouTube data.',
    icon: AlertTriangle,
  },
}

export default function FeedError({
  error,
  onRetry,
  compact = false,
}: {
  error: ApiError
  onRetry?: () => void
  compact?: boolean
}) {
  const meta = KIND_META[error.kind] ?? KIND_META.unknown
  const Icon = meta.icon

  return (
    <div
      role="alert"
      className={`mx-auto flex flex-col items-center gap-3 text-center ${
        compact ? 'max-w-md py-8' : 'max-w-lg py-20'
      }`}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
        <Icon size={24} />
      </span>
      <div>
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{meta.title}</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{meta.description}</p>
        {error.detail && (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">{error.detail}</p>
        )}
      </div>
      {onRetry && error.retryable && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          <RefreshCw size={16} />
          Try again
        </button>
      )}
    </div>
  )
}
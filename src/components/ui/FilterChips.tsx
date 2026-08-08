'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Plus, Sparkles } from 'lucide-react'
import { categories } from '@/lib/categories'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setSelectedCategory } from '@/store/slices/uiSlice'
import { useCustomFeeds } from '@/context/CustomFeedsContext'

/** Horizontal topic chip row below the header — matches the modern YouTube layout. */
export default function FilterChips() {
  const dispatch = useAppDispatch()
  const selectedCategory = useAppSelector((s) => s.ui.selectedCategory)
  const { feeds, addFeed } = useCustomFeeds()
  const router = useRouter()
  const pathname = usePathname()

  const [ready, setReady] = useState(false)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    Promise.resolve().then(() => setReady(true))
  }, [])

  function select(id: string) {
    dispatch(setSelectedCategory(id === 'all' ? null : id))
    if (pathname !== '/') {
      router.push('/')
    }
  }

  function createFeed() {
    const q = query.trim()
    if (!q) return
    const feed = addFeed(name, q)
    setCreating(false)
    setName('')
    setQuery('')
    router.push(`/feed/${feed.id}`)
  }

  return (
    <div className="relative">
      <div className="sticky top-16 z-30 -mx-4 mb-4 flex gap-2 overflow-x-auto bg-white px-4 py-2 no-scrollbar dark:bg-black sm:-mx-6 sm:px-6">
        {categories.map((category) => {
          const active =
            selectedCategory === null ? category.id === 'all' : selectedCategory === category.id
          return (
            <button
              key={category.id}
              onClick={() => select(category.id)}
              aria-pressed={active}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
              }`}
            >
              {category.name}
            </button>
          )
        })}

        {ready &&
          feeds.map((feed) => {
            const active = pathname === `/feed/${feed.id}`
            return (
              <button
                key={feed.id}
                onClick={() => router.push(`/feed/${feed.id}`)}
                aria-pressed={active}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-violet-600 text-white'
                    : 'bg-violet-50 text-violet-700 hover:bg-violet-100 dark:bg-violet-950 dark:text-violet-300 dark:hover:bg-violet-900'
                }`}
              >
                <Sparkles size={14} />
                {feed.name}
              </button>
            )
          })}

        <button
          onClick={() => setCreating((c) => !c)}
          aria-expanded={creating}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-dashed border-zinc-400 px-3.5 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          <Plus size={16} />
          New feed
        </button>
      </div>

      {creating && (
        <div className="absolute top-full right-0 z-40 -mt-2 mb-2 w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-4 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
          <p className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Create a custom feed
          </p>
          <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Search query
          </label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. indie games"
            className="mb-3 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. My indie corner"
            className="mb-4 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setCreating(false)}
              className="rounded-full px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Cancel
            </button>
            <button
              onClick={createFeed}
              disabled={!query.trim()}
              className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Create feed
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
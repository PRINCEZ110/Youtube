'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, Search, TrendingUp } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setQuery } from '@/store/slices/searchSlice'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { mockVideos } from '@/lib/data/mockVideos'

function recentSearches(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem('recentSearches')
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveRecent(query: string) {
  try {
    const next = [query, ...recentSearches().filter((q) => q !== query)].slice(0, 6)
    localStorage.setItem('recentSearches', JSON.stringify(next))
  } catch {
    return
  }
}

export default function SearchInput({ defaultValue = '' }: { defaultValue?: string }) {
  const dispatch = useAppDispatch()
  const query = useAppSelector((s) => s.search.query)
  const router = useRouter()
  const [value, setValue] = useState(defaultValue || query)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const debouncedValue = useDebounce(value, 300)

  useEffect(() => {
    const clean = debouncedValue.trim()
    if (clean !== query) dispatch(setQuery(clean))
  }, [debouncedValue, dispatch, query])

  const recent = recentSearches()
  const trending = Array.from(
    new Set(mockVideos.flatMap((v) => v.tags.slice(0, 2)))
  ).slice(0, 5)

  const suggestions = open ? (recent.length > 0 ? recent : trending) : []

  function go(q: string) {
    const clean = q.trim()
    dispatch(setQuery(clean))
    saveRecent(clean)
    setOpen(false)
    setActive(-1)
    router.push(clean ? `/search?q=${encodeURIComponent(clean)}` : '/search')
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value)
    setActive(-1)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setActive((a) => Math.min(a + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, -1))
    } else if (e.key === 'Enter') {
      if (active >= 0 && suggestions[active]) {
        e.preventDefault()
        go(suggestions[active])
      } else {
        go(value)
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActive(-1)
    }
  }

  return (
    <div className="relative w-full max-w-xl">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          go(value)
        }}
        className="flex w-full items-center overflow-hidden rounded-full border border-zinc-300 focus-within:border-blue-600 dark:border-zinc-700"
      >
        <input
          value={value}
          onChange={onInputChange}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKeyDown}
          placeholder="Search"
          role="combobox"
          aria-expanded={open}
          aria-controls="search-suggestions"
          aria-autocomplete="list"
          className="flex-1 bg-transparent px-4 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-500 dark:text-zinc-100"
        />
        <button
          type="submit"
          aria-label="Search"
          className="flex items-center border-l border-zinc-300 px-4 py-2 text-zinc-500 transition-colors hover:text-zinc-900 dark:border-zinc-700 dark:hover:text-zinc-100"
        >
          <Search size={20} />
        </button>
      </form>

      {open && suggestions.length > 0 && (
        <ul
          id="search-suggestions"
          role="listbox"
          className="absolute top-full left-0 z-20 mt-2 w-full overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
        >
          {suggestions.map((s, i) => (
            <li key={s} role="option" aria-selected={i === active}>
              <button
                onMouseDown={(e) => {
                  e.preventDefault()
                  go(s)
                }}
                onMouseEnter={() => setActive(i)}
                className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-zinc-700 transition-colors dark:text-zinc-300 ${
                  i === active ? 'bg-zinc-100 dark:bg-zinc-900' : 'hover:bg-zinc-100 dark:hover:bg-zinc-900'
                }`}
              >
                {recent.includes(s) ? (
                  <Clock size={16} className="shrink-0 text-zinc-400" />
                ) : (
                  <TrendingUp size={16} className="shrink-0 text-zinc-400" />
                )}
                <span className="truncate">{s}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

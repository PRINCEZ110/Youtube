'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setQuery } from '@/store/slices/searchSlice'

export default function SearchInput({ defaultValue = '' }: { defaultValue?: string }) {
  const dispatch = useAppDispatch()
  const query = useAppSelector((s) => s.search.query)
  const router = useRouter()
  const [value, setValue] = useState(defaultValue || query)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const q = value.trim()
    dispatch(setQuery(q))
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search')
  }

  return (
    <form
      onSubmit={submit}
      className="flex w-full max-w-xl items-center overflow-hidden rounded-full border border-zinc-300 focus-within:border-blue-600 dark:border-zinc-700"
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search"
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
  )
}

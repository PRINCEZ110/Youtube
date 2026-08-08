'use client'

import Link from 'next/link'
import { Menu, Mic, Moon, PlusSquare, Search, Sun } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { useAppDispatch } from '@/store/hooks'
import { toggleSidebar } from '@/store/slices/uiSlice'
import SearchInput from '@/components/search/SearchInput'
import YoutubeIcon from '@/components/ui/YoutubeIcon'
import NotificationsMenu from '@/components/layout/NotificationsMenu'

export default function TopNav() {
  const { theme, toggle } = useTheme()
  const dispatch = useAppDispatch()

  function noop() {}

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b border-zinc-200 bg-white px-4 sm:gap-3 sm:px-4 dark:border-zinc-800 dark:bg-black">
      <button
        onClick={() => dispatch(toggleSidebar())}
        aria-label="Toggle sidebar"
        className="rounded-full p-2 text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
      >
        <Menu size={24} />
      </button>

      <Link href="/" className="flex shrink-0 items-center gap-1">
        <span className="flex h-7 w-9 items-center justify-center">
          <YoutubeIcon size={22} />
        </span>
        <span className="hidden text-xl font-semibold tracking-tight text-zinc-900 sm:inline dark:text-white">
          YouTube
        </span>
      </Link>

      <div className="hidden flex-1 justify-center px-4 sm:flex">
        <div className="flex w-full max-w-xl items-center gap-3">
          <SearchInput />
          <button
            onClick={noop}
            aria-label="Search with voice"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <Mic size={20} />
          </button>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-0.5 sm:ml-0">
        <Link
          href="/search"
          aria-label="Search"
          className="rounded-full p-2 text-zinc-700 transition-colors hover:bg-zinc-100 sm:hidden dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          <Search size={24} />
        </Link>
        <button
          onClick={noop}
          aria-label="Create"
          className="hidden rounded-full p-2 text-zinc-700 transition-colors hover:bg-zinc-100 md:flex dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          <PlusSquare size={24} />
        </button>
        <NotificationsMenu />
        <button
          onClick={noop}
          aria-label="Profile"
          title="Profile"
          className="ml-1 hidden h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-violet-600 text-sm font-bold text-white transition-transform hover:scale-105 sm:flex"
        >
          P
        </button>
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="rounded-full p-2 text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </div>
    </header>
  )
}
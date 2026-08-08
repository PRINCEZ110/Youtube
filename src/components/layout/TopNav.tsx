'use client'

import Link from 'next/link'
import { Menu, Moon, Search, Sun } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { toggleSidebar } from '@/store/slices/uiSlice'
import SearchInput from '@/components/search/SearchInput'
import YoutubeIcon from '@/components/ui/YoutubeIcon'

export default function TopNav() {
  const { theme, toggle } = useTheme()
  const dispatch = useAppDispatch()
  const sidebarOpen = useAppSelector((s) => s.ui.sidebarOpen)

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-black">
      <button
        onClick={() => dispatch(toggleSidebar())}
        aria-label="Toggle sidebar"
        aria-expanded={sidebarOpen}
        aria-controls="app-sidebar"
        className="rounded-full p-2 text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-zinc-200 dark:hover:bg-zinc-900"
      >
        <Menu size={24} />
      </button>

      <Link
        href="/"
        className="flex items-center gap-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
      >
        <span className="flex h-7 w-9 items-center justify-center">
          <YoutubeIcon size={22} />
        </span>
        <span className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          YouTube
        </span>
      </Link>

      <div className="hidden flex-1 justify-center px-4 sm:flex">
        <SearchInput />
      </div>

      <div className="ml-auto flex items-center gap-1 sm:ml-0">
        <Link
          href="/search"
          aria-label="Search"
          className="rounded-full p-2 text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 sm:hidden dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          <Search size={24} />
        </Link>
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="rounded-full p-2 text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </div>
    </header>
  )
}

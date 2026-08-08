'use client'

import Link from 'next/link'
import { Bell, Menu, Moon, Play, PlusSquare, Search, Sun, User } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { toggleSidebar } from '@/store/slices/uiSlice'
import SearchInput from '@/components/search/SearchInput'

export default function TopNav() {
  const { theme, toggle } = useTheme()
  const dispatch = useAppDispatch()
  const sidebarOpen = useAppSelector((s) => s.ui.sidebarOpen)

  function noop() {}

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
        <span className="flex h-7 w-9 items-center justify-center rounded-lg bg-red-600">
          <Play size={18} className="fill-white text-white" />
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
          onClick={noop}
          aria-label="Create"
          className="hidden rounded-full p-2 text-zinc-700 transition-colors hover:bg-zinc-100 md:block dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          <PlusSquare size={24} />
        </button>
        <button
          onClick={noop}
          aria-label="Notifications"
          className="relative hidden rounded-full p-2 text-zinc-700 transition-colors hover:bg-zinc-100 sm:block dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          <Bell size={24} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600" />
        </button>
        <button
          onClick={noop}
          aria-label="Profile"
          className="ml-1 hidden h-9 w-9 items-center justify-center rounded-full bg-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-300 sm:flex dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          <User size={20} />
        </button>
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

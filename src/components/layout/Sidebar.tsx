'use client'

import { Bookmark, History, Home, ListVideo, ThumbsUp } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setSelectedCategory } from '@/store/slices/uiSlice'

interface NavItem {
  href: string
  label: string
  Icon: typeof Home
}

const YOU: NavItem[] = [
  { href: '/history', label: 'History', Icon: History },
  { href: '/library', label: 'Watch later', Icon: Bookmark },
  { href: '/liked', label: 'Liked videos', Icon: ThumbsUp },
  { href: '/playlists', label: 'Playlists', Icon: ListVideo },
]

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const dispatch = useAppDispatch()
  const selectedCategory = useAppSelector((s) => s.ui.selectedCategory)
  const router = useRouter()
  const pathname = usePathname()

  function goHome() {
    dispatch(setSelectedCategory(null))
    onNavigate?.()
    if (pathname !== '/') {
      router.push('/')
    }
  }

  function nav(href: string) {
    onNavigate?.()
    router.push(href)
  }

  function itemClass(active: boolean) {
    return `flex items-center gap-5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
      active
        ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
        : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900'
    }`
  }

  return (
    <nav className="flex flex-col gap-1 overflow-y-auto px-3 py-4">
      <button onClick={goHome} className={itemClass(selectedCategory === null && pathname === '/')}>
        <Home size={22} />
        <span className="truncate">Home</span>
      </button>

      <p className="mt-4 mb-1 px-3 text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
        You
      </p>
      {YOU.map(({ href, label, Icon }) => (
        <button
          key={`${href}-${label}`}
          onClick={() => nav(href)}
          className={itemClass(pathname.startsWith(href))}
        >
          <Icon size={22} />
          <span className="truncate">{label}</span>
        </button>
      ))}
    </nav>
  )
}

export default function Sidebar() {
  const sidebarOpen = useAppSelector((s) => s.ui.sidebarOpen)

  return (
    <aside
      className={`sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 lg:block ${
        sidebarOpen ? 'lg:hidden' : ''
      }`}
    >
      <SidebarContent />
    </aside>
  )
}
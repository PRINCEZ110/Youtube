'use client'

import {
  Bookmark,
  History,
  Home,
  ListVideo,
  PlaySquare,
  ThumbsUp,
  Tv,
} from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setSelectedCategory } from '@/store/slices/uiSlice'

interface NavItem {
  href: string
  label: string
  Icon: typeof Home
}

const RAIL: NavItem[] = [
  { href: '/', label: 'Home', Icon: Home },
  { href: '/#shorts', label: 'Shorts', Icon: PlaySquare },
  { href: '/subscriptions', label: 'Subscriptions', Icon: Tv },
]

const YOU: NavItem[] = [
  { href: '/history', label: 'History', Icon: History },
  { href: '/library', label: 'Watch later', Icon: Bookmark },
  { href: '/liked', label: 'Liked videos', Icon: ThumbsUp },
  { href: '/playlists', label: 'Playlists', Icon: ListVideo },
]

/** Full-width list — used inside the mobile drawer. */
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
      <button onClick={() => nav('/#shorts')} className={itemClass(false)}>
        <PlaySquare size={22} />
        <span className="truncate">Shorts</span>
      </button>
      <button onClick={() => nav('/subscriptions')} className={itemClass(false)}>
        <Tv size={22} />
        <span className="truncate">Subscriptions</span>
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

function railItemClass(active: boolean) {
  return `flex h-11 w-full items-center gap-6 rounded-xl px-4 text-sm font-medium transition-colors ${
    active
      ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
      : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900'
  }`
}

/** Collapsed desktop rail — expands on hover unless pinned by the menu button. */
const Sidebar = function SidebarRail() {
  const dispatch = useAppDispatch()
  const selectedCategory = useAppSelector((s) => s.ui.selectedCategory)
  const pinned = useAppSelector((s) => s.ui.sidebarOpen)
  const router = useRouter()
  const pathname = usePathname()

  function goHome() {
    dispatch(setSelectedCategory(null))
    if (pathname !== '/') {
      router.push('/')
    }
  }

  function nav(href: string) {
    if (href.startsWith('/#')) {
      if (pathname !== '/') {
        router.push('/')
        return
      }
      document.getElementById('shorts')?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    router.push(href)
  }

  return (
    <aside
      aria-label="Sidebar"
      className={`group sticky top-16 hidden h-[calc(100vh-4rem)] shrink-0 flex-col overflow-hidden border-r border-zinc-200 px-2 py-2 transition-all duration-200 dark:border-zinc-800 lg:flex ${
        pinned ? 'w-64' : 'w-20 hover:w-64'
      }`}
    >
      <nav className="flex flex-col gap-1 overflow-y-auto">
        <button
          onClick={goHome}
          className={railItemClass(selectedCategory === null && pathname === '/')}
          title="Home"
        >
          <Home size={22} className="shrink-0" />
          <span className="hidden group-hover:inline dark:group-hover:inline">Home</span>
        </button>
        {[RAIL[1], RAIL[2], ...YOU].map(({ href, label, Icon }) => {
          const active =
            href === '/subscriptions' ? pathname.startsWith('/subscriptions') : pathname.startsWith(href)
          return (
            <button
              key={href + label}
              onClick={() => nav(href)}
              className={railItemClass(active)}
              title={label}
            >
              <Icon size={22} className="shrink-0" />
              <span className="hidden group-hover:inline">{label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar
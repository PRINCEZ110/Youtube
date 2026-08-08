'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Clock, Home, Library, Search } from 'lucide-react'

const ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/library', label: 'Library', icon: Library },
  { href: '/history', label: 'History', icon: Clock },
]

export default function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 flex h-14 items-stretch border-t border-zinc-200 bg-white lg:hidden dark:border-zinc-800 dark:bg-black"
    >
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active =
          href === '/' ? pathname === '/' : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
              active
                ? 'text-red-600 dark:text-red-500'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
            }`}
          >
            <Icon size={22} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
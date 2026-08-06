'use client'

import {
  Clapperboard,
  Gamepad2,
  GraduationCap,
  Home,
  Monitor,
  Music,
  Newspaper,
  Trophy,
} from 'lucide-react'
import { categories } from '@/lib/data/mockCategories'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setSelectedCategory } from '@/store/slices/uiSlice'

const ICONS = {
  Home,
  Music,
  Gamepad2,
  Newspaper,
  Trophy,
  GraduationCap,
  Clapperboard,
  Monitor,
} as const

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const dispatch = useAppDispatch()
  const selectedCategory = useAppSelector((s) => s.ui.selectedCategory)

  function select(id: string) {
    dispatch(setSelectedCategory(id === 'all' ? null : id))
    onNavigate?.()
  }

  return (
    <nav className="flex flex-col gap-1 overflow-y-auto px-3 py-4">
      {categories.map((category) => {
        const Icon = ICONS[category.icon as keyof typeof ICONS] ?? Home
        const active = selectedCategory === null
          ? category.id === 'all'
          : selectedCategory === category.id
        return (
          <button
            key={category.id}
            onClick={() => select(category.id)}
            className={`flex items-center gap-5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900'
            }`}
          >
            <Icon size={22} />
            <span className="truncate">{category.name}</span>
          </button>
        )
      })}
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

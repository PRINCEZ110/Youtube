'use client'

import { Play, X } from 'lucide-react'
import Link from 'next/link'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { toggleSidebar } from '@/store/slices/uiSlice'
import { SidebarContent } from '@/components/layout/Sidebar'

export default function MobileNav() {
  const dispatch = useAppDispatch()
  const open = useAppSelector((s) => s.ui.sidebarOpen)

  function close() {
    dispatch(toggleSidebar())
  }

  return (
    <div
      className={`fixed inset-0 z-50 lg:hidden ${
        open ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      aria-hidden={!open}
    >
      <div
        onClick={close}
        className={`absolute inset-0 bg-black/50 transition-opacity ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        className={`absolute top-0 left-0 flex h-full w-72 flex-col bg-white shadow-xl transition-transform duration-200 dark:bg-zinc-950 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800">
          <Link href="/" onClick={close} className="flex items-center gap-1">
            <span className="flex h-7 w-9 items-center justify-center rounded-lg bg-red-600">
              <Play size={18} className="fill-white text-white" />
            </span>
            <span className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">
              YouTube
            </span>
          </Link>
          <button
            onClick={close}
            aria-label="Close sidebar"
            className="rounded-full p-2 text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            <X size={24} />
          </button>
        </div>
        <SidebarContent onNavigate={close} />
      </div>
    </div>
  )
}

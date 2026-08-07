'use client'

import { useState } from 'react'

const TABS = ['Home', 'Videos', 'Shorts', 'Live', 'Playlists', 'Community', 'About']

export default function ChannelTabs() {
  const [active, setActive] = useState('Videos')

  return (
    <nav aria-label="Channel tabs" className="flex gap-2 overflow-x-auto border-b border-zinc-200 dark:border-zinc-800">
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => setActive(tab)}
          aria-current={active === tab ? 'page' : undefined}
          className={`relative shrink-0 px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
            active === tab
              ? 'text-zinc-900 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-zinc-900 dark:text-zinc-100 dark:after:bg-zinc-100'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          }`}
        >
          {tab}
        </button>
      ))}
    </nav>
  )
}

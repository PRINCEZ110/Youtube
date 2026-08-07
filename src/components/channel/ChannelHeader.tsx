'use client'

import { useState } from 'react'
import Image from 'next/image'
import ChannelAvatar from '@/components/ui/ChannelAvatar'
import { formatViews } from '@/lib/utils'

export default function ChannelHeader({
  name,
  avatarUrl,
  subscribers,
  banner,
}: {
  name: string
  avatarUrl: string
  subscribers: number
  banner: string
}) {
  const [subscribed, setSubscribed] = useState(false)

  return (
    <div className="overflow-hidden rounded-xl">
      <div className="relative h-40 w-full bg-zinc-200 dark:bg-zinc-800 sm:h-52">
        <Image src={banner} alt="" fill sizes="100vw" className="object-cover" />
      </div>
      <div className="flex flex-col gap-4 bg-white p-4 dark:bg-zinc-950 sm:flex-row sm:items-center sm:gap-5 sm:px-6">
        <ChannelAvatar name={name} avatarUrl={avatarUrl} size={88} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {name}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {formatViews(subscribers)} subscribers
          </p>
        </div>
        <button
          onClick={() => setSubscribed((s) => !s)}
          className="self-start rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {subscribed ? 'Subscribed' : 'Subscribe'}
        </button>
      </div>
    </div>
  )
}

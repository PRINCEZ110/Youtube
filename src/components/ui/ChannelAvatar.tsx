'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const COLORS = [
  'bg-red-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-green-500',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-sky-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-fuchsia-500',
  'bg-rose-500',
]

function colorFor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return COLORS[Math.abs(hash) % COLORS.length]
}

export default function ChannelAvatar({
  name,
  avatarUrl,
  size = 40,
  channelId,
}: {
  name: string
  avatarUrl?: string
  size?: number
  channelId?: string
}) {
  const [failed, setFailed] = useState(false)
  const showImage = !!avatarUrl && !failed
  const fallbackColor = colorFor(name || '?')

  const inner = showImage ? (
    <Image
      src={avatarUrl!}
      alt={name}
      fill
      sizes={`${size * 2}px`}
      className="object-cover"
      onError={() => setFailed(true)}
    />
  ) : (
    <span
      className="flex h-full w-full items-center justify-center font-medium text-white select-none"
      style={{ fontSize: size * 0.45 }}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  )

  const className = `relative flex shrink-0 items-center justify-center overflow-hidden rounded-full ${
    showImage ? '' : fallbackColor
  }`
  const style = { width: size, height: size }

  if (channelId) {
    return (
      <Link
        href={`/channel/${channelId}`}
        aria-label={`${name} channel`}
        className={`${className} transition-opacity hover:opacity-80`}
        style={style}
      >
        {inner}
      </Link>
    )
  }

  return (
    <div className={className} style={style}>
      {inner}
    </div>
  )
}
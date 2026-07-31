'use client'

import { useState } from 'react'

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
}: {
  name: string
  avatarUrl?: string
  size?: number
}) {
  const [failed, setFailed] = useState(false)
  const showImage = !!avatarUrl && !failed

  return (
    <div
      className={`flex items-center justify-center rounded-full overflow-hidden ${
        showImage ? '' : colorFor(name)
      }`}
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <img
          src={avatarUrl}
          alt={name}
          width={size}
          height={size}
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className="text-white font-medium select-none"
          style={{ fontSize: size * 0.45 }}
        >
          {name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  )
}

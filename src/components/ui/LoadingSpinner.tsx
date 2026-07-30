'use client'

import { Loader } from 'lucide-react'

export default function LoadingSpinner({ size = 24 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center">
      <Loader size={size} className="animate-spin text-zinc-500" />
    </div>
  )
}

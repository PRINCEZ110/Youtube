import type { LucideIcon } from 'lucide-react'

export default function EmptyState({
  message,
  icon: Icon,
}: {
  message: string
  icon?: LucideIcon
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      {Icon && <Icon size={40} className="text-zinc-400" />}
      <p className="text-zinc-500">{message}</p>
    </div>
  )
}

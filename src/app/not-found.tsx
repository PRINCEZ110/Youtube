import Link from 'next/link'
import { Play } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-black">
      <header className="flex h-16 items-center gap-1 border-b border-zinc-200 px-4 dark:border-zinc-800">
        <Link href="/" className="flex items-center gap-1">
          <span className="flex h-7 w-9 items-center justify-center rounded-lg bg-red-600">
            <Play size={18} className="fill-white text-white" />
          </span>
          <span className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            YouTube
          </span>
        </Link>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Page not found</h1>
        <p className="max-w-md text-sm text-zinc-600 dark:text-zinc-400">
          The page you&apos;re looking for doesn&apos;t exist, or this video or channel is
          unavailable.
        </p>
        <Link
          href="/"
          className="mt-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Go home
        </Link>
      </main>
    </div>
  )
}
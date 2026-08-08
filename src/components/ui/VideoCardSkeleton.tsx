export default function VideoCardSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      <div className="aspect-video animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      <div className="flex gap-3">
        <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-4 w-11/12 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-3/5 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-3 w-2/5 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    </div>
  )
}
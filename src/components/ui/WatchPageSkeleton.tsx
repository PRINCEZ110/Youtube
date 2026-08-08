export default function WatchPageSkeleton() {
  return (
    <div className="mx-auto flex max-w-[1600px] gap-6">
      <div className="min-w-0 flex-1">
        <div className="aspect-video w-full animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="flex flex-col gap-3 py-5">
          <div className="h-5 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-4 w-1/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-3 w-1/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>
          <div className="mt-1 h-24 w-full animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
      <aside className="hidden w-96 shrink-0 gap-3 lg:flex lg:flex-col">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex gap-3">
            <div className="aspect-video w-40 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex flex-1 flex-col gap-2 py-1">
              <div className="h-4 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>
        ))}
      </aside>
    </div>
  )
}
import Skeleton from '@/components/ui/Skeleton'

export default function VideoCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="aspect-video w-full" />
      <div className="flex gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    </div>
  )
}

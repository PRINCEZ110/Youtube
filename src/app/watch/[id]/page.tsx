import TopNav from '@/components/layout/TopNav'
import MobileNav from '@/components/layout/MobileNav'
import WatchPageClient from './WatchPageClient'

export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="min-h-full bg-white dark:bg-black">
      <TopNav />
      <MobileNav />
      <WatchPageClient id={id} />
    </div>
  )
}

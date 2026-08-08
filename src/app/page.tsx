import TopNav from '@/components/layout/TopNav'
import Sidebar from '@/components/layout/Sidebar'
import MobileNav from '@/components/layout/MobileNav'
import FilterChips from '@/components/ui/FilterChips'
import VideoGrid from '@/components/video/VideoGrid'
import ContinueWatching from '@/components/video/ContinueWatching'

export default function Home() {
  return (
    <div className="min-h-full bg-white dark:bg-black">
      <TopNav />
      <MobileNav />
      <div className="flex">
        <Sidebar />
        <main className="min-w-0 flex-1 px-4 py-4 sm:px-6">
          <FilterChips />
          <ContinueWatching />
          <VideoGrid />
        </main>
      </div>
    </div>
  )
}
import TopNav from '@/components/layout/TopNav'
import Sidebar from '@/components/layout/Sidebar'
import MobileNav from '@/components/layout/MobileNav'
import CategoryChips from '@/components/home/CategoryChips'
import VideoGrid from '@/components/video/VideoGrid'

export default function Home() {
  return (
    <div className="min-h-full bg-white dark:bg-black">
      <TopNav />
      <MobileNav />
      <div className="flex">
        <Sidebar />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6">
          <CategoryChips />
          <VideoGrid />
        </main>
      </div>
    </div>
  )
}

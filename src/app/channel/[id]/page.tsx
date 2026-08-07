import { mockVideos } from '@/lib/data/mockVideos'
import TopNav from '@/components/layout/TopNav'
import MobileNav from '@/components/layout/MobileNav'
import ChannelHeader from '@/components/channel/ChannelHeader'
import ChannelTabs from '@/components/channel/ChannelTabs'
import ChannelVideos from '@/components/channel/ChannelVideos'

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const channel = mockVideos.find((v) => v.channelId === id)
  const videos = mockVideos.filter((v) => v.channelId === id)

  if (!channel) {
    return (
      <div className="min-h-full bg-white dark:bg-black">
        <TopNav />
        <MobileNav />
        <main className="px-4 py-24 text-center text-zinc-500">
          Channel not found
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-white dark:bg-black">
      <TopNav />
      <MobileNav />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <ChannelHeader
          name={channel.channelName}
          avatarUrl={channel.channelAvatar}
          subscribers={channel.views * 3}
          banner={channel.thumbnail}
        />
        <div className="mt-4">
          <ChannelTabs />
        </div>
        <div className="mt-6">
          <ChannelVideos videos={videos} />
        </div>
      </main>
    </div>
  )
}

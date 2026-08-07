import Image from 'next/image'
import Link from 'next/link'

export default function PlaylistCard({
  id,
  name,
  videoCount,
  thumbnail,
}: {
  id: string
  name: string
  videoCount: number
  thumbnail: string
}) {
  return (
    <Link
      href={`/playlists/${id}`}
      className="group flex flex-col gap-3 rounded-xl p-2 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900"
    >
      <div className="relative aspect-video overflow-hidden rounded-xl">
        <Image
          src={thumbnail}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute right-2 bottom-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
          {videoCount} {videoCount === 1 ? 'video' : 'videos'}
        </span>
      </div>
      <p className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
        {name}
      </p>
    </Link>
  )
}

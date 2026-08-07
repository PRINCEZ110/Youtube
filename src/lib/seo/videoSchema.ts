import type { Video } from '@/lib/data/mockVideos'

function toIsoDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  let iso = 'PT'
  if (h > 0) iso += `${h}H`
  if (m > 0 || h > 0) iso += `${m}M`
  iso += `${s}S`
  return iso
}

export function videoJsonLd(video: Video): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.description,
    thumbnailUrl: [video.thumbnail],
    uploadDate: video.uploadedAt.toISOString(),
    duration: toIsoDuration(video.duration),
    viewCount: video.views,
    publisher: {
      '@type': 'Organization',
      name: video.channelName,
      logo: {
        '@type': 'ImageObject',
        url: video.channelAvatar,
      },
    },
  }
}
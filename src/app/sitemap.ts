import type { MetadataRoute } from 'next'
import { mockVideos } from '@/lib/data/mockVideos'
import { SITE_URL } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/search`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/history`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/library`, changeFrequency: 'weekly', priority: 0.6 },
  ]
  const videoRoutes: MetadataRoute.Sitemap = mockVideos.map((video) => ({
    url: `${SITE_URL}/watch/${video.id}`,
    lastModified: video.uploadedAt,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))
  return [...staticRoutes, ...videoRoutes]
}
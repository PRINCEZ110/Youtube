import type { Metadata } from 'next'

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

interface BuildMetadataParams {
  title: string
  description: string
  path: string
  image?: string
}

export function buildMetadata({ title, description, path, image }: BuildMetadataParams): Metadata {
  const url = `${SITE_URL}${path}`
  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}
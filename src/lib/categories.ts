import type { LocalCategoryId } from '@/lib/youtube/types'

export interface Category {
  id: Exclude<LocalCategoryId, 'all'> | 'all'
  name: string
  icon: string
}

/** Category chips shown in the sidebar / mobile drawer. */
export const categories: Category[] = [
  { id: 'all', name: 'All', icon: 'Home' },
  { id: 'music', name: 'Music', icon: 'Music' },
  { id: 'gaming', name: 'Gaming', icon: 'Gamepad2' },
  { id: 'news', name: 'News', icon: 'Newspaper' },
  { id: 'sports', name: 'Sports', icon: 'Trophy' },
  { id: 'education', name: 'Education', icon: 'GraduationCap' },
  { id: 'entertainment', name: 'Entertainment', icon: 'Clapperboard' },
  { id: 'technology', name: 'Technology', icon: 'Monitor' },
]
'use client'

import { categories } from '@/lib/data/mockCategories'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setSelectedCategory } from '@/store/slices/uiSlice'

export default function CategoryChips() {
  const dispatch = useAppDispatch()
  const selectedCategory = useAppSelector((s) => s.ui.selectedCategory)

  return (
    <div className="flex gap-2 overflow-x-auto scroll-smooth pb-4">
      {categories.map((category) => {
        const active = selectedCategory === null
          ? category.id === 'all'
          : selectedCategory === category.id
        return (
          <button
            key={category.id}
            onClick={() => dispatch(setSelectedCategory(category.id === 'all' ? null : category.id))}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
              active
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            }`}
          >
            {category.name}
          </button>
        )
      })}
    </div>
  )
}

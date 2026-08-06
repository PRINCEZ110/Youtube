import TopNav from '@/components/layout/TopNav'
import MobileNav from '@/components/layout/MobileNav'
import SearchInput from '@/components/search/SearchInput'
import SearchResults from '@/components/search/SearchResults'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = '' } = await searchParams

  return (
    <div className="min-h-full bg-white dark:bg-black">
      <TopNav />
      <MobileNav />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-6 sm:hidden">
          <SearchInput defaultValue={q} />
        </div>
        <SearchResults query={q} />
      </main>
    </div>
  )
}
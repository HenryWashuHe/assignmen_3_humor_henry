import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { AnimatedPage } from '@/components/AnimatedPage'
import { FlavorsTable } from '@/components/FlavorsTable'

export const dynamic = 'force-dynamic'

export default async function FlavorsPage() {
  const supabase = await createClient()

  const { data: flavors, error } = await supabase
    .from('humor_flavors')
    .select('id, slug, description, created_datetime_utc')
    .order('created_datetime_utc', { ascending: false })

  const flavorIds = flavors?.map((f) => f.id) ?? []

  const stepCounts: Record<number, number> = {}
  if (flavorIds.length > 0) {
    const { data: steps } = await supabase
      .from('humor_flavor_steps')
      .select('humor_flavor_id')
      .in('humor_flavor_id', flavorIds)

    steps?.forEach((s) => {
      stepCounts[s.humor_flavor_id] = (stepCounts[s.humor_flavor_id] ?? 0) + 1
    })
  }

  return (
    <AnimatedPage>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Humor Flavors</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              {flavors?.length ?? 0} flavor{flavors?.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <Link
            href="/flavors/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-sm font-medium shadow-sm shadow-indigo-500/30 hover:shadow-md hover:shadow-indigo-500/40 transition-all duration-200 hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Flavor
          </Link>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-4 mb-6">
            <p className="text-sm text-red-700 dark:text-red-300">Failed to load flavors: {error.message}</p>
          </div>
        )}

        <FlavorsTable flavors={flavors ?? []} stepCounts={stepCounts} />
      </div>
    </AnimatedPage>
  )
}

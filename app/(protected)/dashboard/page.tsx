import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { AnimatedPage } from '@/components/AnimatedPage'
import { StatCards, QuickActionsCard, CaptionsOverTimeCard } from '@/components/DashboardStats'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [{ count: flavorCount }, { count: captionCount }] = await Promise.all([
    supabase.from('humor_flavors').select('*', { count: 'exact', head: true }),
    supabase.from('captions').select('*', { count: 'exact', head: true }),
  ])

  const { data: recentFlavors } = await supabase
    .from('humor_flavors')
    .select('id, slug, description, created_datetime_utc')
    .order('created_datetime_utc', { ascending: false })
    .limit(5)

  // Fetch captions over time
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: captionRows } = await supabase
    .from('captions')
    .select('created_datetime_utc')
    .gte('created_datetime_utc', thirtyDaysAgo.toISOString())
    .order('created_datetime_utc', { ascending: true })

  const countsByDate: Record<string, number> = {}
  for (const row of captionRows ?? []) {
    if (!row.created_datetime_utc) continue
    const date = new Date(row.created_datetime_utc).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
    countsByDate[date] = (countsByDate[date] ?? 0) + 1
  }
  const captionsOverTime = Object.entries(countsByDate).map(([date, count]) => ({
    date,
    count,
  }))

  return (
    <AnimatedPage>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Dashboard</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Overview of your humor flavor system
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCards
            flavorCount={flavorCount ?? 0}
            captionCount={captionCount ?? 0}
          />
          <QuickActionsCard />
          <CaptionsOverTimeCard data={captionsOverTime} />
        </div>

        {/* Recent Flavors */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Recent Flavors</h2>
            <Link
              href="/flavors"
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {recentFlavors?.length === 0 && (
              <div className="px-6 py-8 text-center text-zinc-400 dark:text-zinc-500">
                No flavors yet.{' '}
                <Link href="/flavors/new" className="text-zinc-600 dark:text-zinc-300 underline">
                  Create your first flavor
                </Link>
              </div>
            )}
            {recentFlavors?.map((flavor) => (
              <Link
                key={flavor.id}
                href={`/flavors/${flavor.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {flavor.slug}
                  </p>
                  {flavor.description && (
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                      {flavor.description}
                    </p>
                  )}
                </div>
                <span className="text-xs text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
                  {flavor.created_datetime_utc
                    ? new Date(flavor.created_datetime_utc).toLocaleDateString()
                    : '—'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AnimatedPage>
  )
}

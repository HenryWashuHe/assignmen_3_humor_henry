import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { AnimatedPage } from '@/components/AnimatedPage'
import { StatCard, QuickActionsCard, CaptionsOverTimeCard } from '@/components/DashboardStats'

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

  const flavorsIcon = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  )

  const captionsIcon = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )

  return (
    <AnimatedPage>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Dashboard</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Overview of your humor flavor system
          </p>
        </div>

        {/* Stats grid — each child is a proper element, no fragments */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Total Flavors"
            value={flavorCount ?? 0}
            href="/flavors"
            linkLabel="View all flavors →"
            delay={0}
            icon={flavorsIcon}
          />
          <StatCard
            label="Total Captions"
            value={captionCount ?? 0}
            href="/captions"
            linkLabel="View all captions →"
            delay={0.08}
            icon={captionsIcon}
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
              className="text-sm text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {recentFlavors?.length === 0 && (
              <div className="px-6 py-8 text-center text-zinc-400 dark:text-zinc-500">
                No flavors yet.{' '}
                <Link href="/flavors/new" className="text-indigo-500 dark:text-indigo-400 hover:underline">
                  Create your first flavor
                </Link>
              </div>
            )}
            {recentFlavors?.map((flavor) => (
              <Link
                key={flavor.id}
                href={`/flavors/${flavor.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
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
                <svg className="w-4 h-4 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AnimatedPage>
  )
}

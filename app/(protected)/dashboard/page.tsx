import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { AnimatedPage } from '@/components/AnimatedPage'
import { AppShell } from '@/components/AppShell'
import { StatCard, QuickActionsCard, CaptionsOverTimeCard } from '@/components/DashboardStats'
import { PageHeader } from '@/components/PageHeader'

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
      <AppShell>
        <div className="space-y-8">
          <PageHeader
            eyebrow="Overview"
            title="Dashboard"
            description="Track flavor inventory, recent experimentation activity, and caption generation trends from one place."
            badge="Matrix control room"
            actions={
              <>
                <Link
                  href="/flavors/new"
                  className="inline-flex items-center gap-2 rounded-[16px] bg-[#e60023] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#c9001e]"
                >
                  New Flavor
                </Link>
                <Link
                  href="/test"
                  className="inline-flex items-center gap-2 rounded-[16px] bg-[#e5e5e0] px-4 py-2.5 text-sm font-medium text-[#211922] transition-colors hover:bg-[#d5d5d0] dark:bg-[#3e3e39] dark:text-[#f6f6f3] dark:hover:bg-[#4a4a44]"
                >
                  Run Test
                </Link>
              </>
            }
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Total Flavors"
              value={flavorCount ?? 0}
              href="/flavors"
              linkLabel="View all flavors"
              delay={0}
              icon={flavorsIcon}
            />
            <StatCard
              label="Total Captions"
              value={captionCount ?? 0}
              href="/captions"
              linkLabel="View all captions"
              delay={0.08}
              icon={captionsIcon}
            />
            <QuickActionsCard />
            <CaptionsOverTimeCard data={captionsOverTime} />
          </div>

          <div className="glass-surface overflow-hidden rounded-[28px]">
            <div className="flex items-center justify-between gap-4 border-b border-[#e5e5e0] px-6 py-5 dark:border-[#3e3e39]">
              <div>
                <h2 className="text-base font-semibold text-[#211922] dark:text-[#f6f6f3]">Recent Flavors</h2>
                <p className="mt-1 text-sm text-[#62625b] dark:text-[#b4b4ad]">
                  Recently created pipelines and experiment branches.
                </p>
              </div>
              <Link
                href="/flavors"
                className="text-sm font-medium text-[#e60023] transition-colors hover:text-[#c9001e] dark:text-[#ff4d6a] dark:hover:text-[#ff6680]"
              >
                View all
              </Link>
            </div>
            <div className="divide-y divide-[#e5e5e0] dark:divide-[#3e3e39]">
              {recentFlavors?.length === 0 && (
                <div className="px-6 py-8 text-center text-[#91918c]">
                  No flavors yet.{' '}
                  <Link href="/flavors/new" className="text-[#e60023] dark:text-[#ff4d6a] hover:underline">
                    Create your first flavor
                  </Link>
                </div>
              )}
              {recentFlavors?.map((flavor) => (
                <Link
                  key={flavor.id}
                  href={`/flavors/${flavor.id}`}
                  className="group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[#f6f6f3]/80 dark:hover:bg-[#3e3e39]/40"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[#e5e5e0] dark:bg-[#3e3e39] text-sm font-semibold text-[#e60023] ring-1 ring-[#e5e5e0] dark:ring-[#3e3e39]">
                    {flavor.slug.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#211922] transition-colors group-hover:text-[#e60023] dark:text-[#f6f6f3] dark:group-hover:text-[#ff4d6a]">
                      {flavor.slug}
                    </p>
                    {flavor.description && (
                      <p className="mt-0.5 truncate text-xs text-[#62625b] dark:text-[#b4b4ad]">
                        {flavor.description}
                      </p>
                    )}
                  </div>
                  <span className="whitespace-nowrap text-xs text-[#91918c]">
                    {flavor.created_datetime_utc
                      ? new Date(flavor.created_datetime_utc).toLocaleDateString()
                      : '—'}
                  </span>
                  <svg className="h-4 w-4 flex-shrink-0 text-[#91918c] transition-colors group-hover:text-[#e60023] dark:group-hover:text-[#ff4d6a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </AppShell>
    </AnimatedPage>
  )
}

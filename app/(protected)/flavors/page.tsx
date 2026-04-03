import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { AnimatedPage } from '@/components/AnimatedPage'
import { AppShell } from '@/components/AppShell'
import { FlavorsTable } from '@/components/FlavorsTable'
import { PageHeader } from '@/components/PageHeader'

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
      <AppShell>
        <div className="space-y-8">
          <PageHeader
            eyebrow="Flavor Library"
            title="Humor Flavors"
            description="Manage reusable caption-generation strategies, compare pipeline variants, and branch new experiments quickly."
            badge={`${flavors?.length ?? 0} total`}
            actions={
              <Link
                href="/flavors/new"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_18px_40px_-22px_rgba(14,165,233,0.95)] transition-all hover:-translate-y-0.5 hover:brightness-105"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Flavor
              </Link>
            }
          />

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/40">
              <p className="text-sm text-red-700 dark:text-red-300">Failed to load flavors: {error.message}</p>
            </div>
          )}

          <FlavorsTable flavors={flavors ?? []} stepCounts={stepCounts} />
        </div>
      </AppShell>
    </AnimatedPage>
  )
}

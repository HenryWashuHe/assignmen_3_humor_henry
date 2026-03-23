import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'

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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Dashboard</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Overview of your humor flavor system
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Flavors</p>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">
            {flavorCount ?? 0}
          </p>
          <Link href="/flavors" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mt-2 inline-block transition-colors">
            View all flavors →
          </Link>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Captions</p>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">
            {captionCount ?? 0}
          </p>
          <Link href="/captions" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mt-2 inline-block transition-colors">
            View all captions →
          </Link>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Quick Actions</p>
          <div className="mt-3 space-y-2">
            <Link
              href="/flavors/new"
              className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Flavor
            </Link>
            <Link
              href="/test"
              className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Test a Flavor
            </Link>
          </div>
        </div>
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
  )
}

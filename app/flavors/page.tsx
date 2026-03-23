import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function FlavorsPage() {
  const supabase = await createClient()

  const { data: flavors, error } = await supabase
    .from('humor_flavors')
    .select('id, slug, description, created_datetime_utc')
    .order('created_datetime_utc', { ascending: false })

  const flavorIds = flavors?.map((f) => f.id) ?? []

  // Fetch step counts per flavor
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
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
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

      {!flavors || flavors.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700">
          <svg className="w-12 h-12 mx-auto mb-4 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <p className="text-zinc-400 dark:text-zinc-500 text-sm mb-4">No humor flavors yet</p>
          <Link
            href="/flavors/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Create your first flavor
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Steps</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {flavors.map((flavor) => (
                <tr key={flavor.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                  <td className="px-6 py-4">
                    <Link
                      href={`/flavors/${flavor.id}`}
                      className="text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:underline"
                    >
                      {flavor.slug}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs truncate">
                      {flavor.description ?? '—'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      {stepCounts[flavor.id] ?? 0} step{stepCounts[flavor.id] !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400 dark:text-zinc-500">
                    {flavor.created_datetime_utc
                      ? new Date(flavor.created_datetime_utc).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/flavors/${flavor.id}`}
                      className="text-sm text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

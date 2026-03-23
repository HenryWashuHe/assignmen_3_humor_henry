import { createClient } from '@/lib/supabase-server'
import Image from 'next/image'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 20

interface PageProps {
  searchParams: Promise<{ page?: string; flavor?: string }>
}

export default async function CaptionsPage({ searchParams }: PageProps) {
  const { page: pageParam, flavor: flavorParam } = await searchParams
  const page = Math.max(1, Number(pageParam ?? 1))
  const flavorId = flavorParam ? Number(flavorParam) : null
  const offset = (page - 1) * PAGE_SIZE

  const supabase = await createClient()

  const { data: flavors } = await supabase
    .from('humor_flavors')
    .select('id, slug')
    .order('slug')

  let query = supabase
    .from('captions')
    .select(
      'id, content, created_datetime_utc, humor_flavor_id, image_id, humor_flavors(id, slug), images(id, url)',
      { count: 'exact' }
    )
    .order('created_datetime_utc', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (flavorId) {
    query = query.eq('humor_flavor_id', flavorId)
  }

  const { data: captions, count } = await query

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  const buildUrl = (p: number, f?: number | null) => {
    const params = new URLSearchParams()
    if (p > 1) params.set('page', String(p))
    if (f) params.set('flavor', String(f))
    const qs = params.toString()
    return `/captions${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Captions</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            {count ?? 0} caption{count !== 1 ? 's' : ''} total
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 mb-6 flex items-center gap-4">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
          Filter by flavor:
        </label>
        <div className="flex gap-2 flex-wrap">
          <Link
            href={buildUrl(1, null)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              !flavorId
                ? 'bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            All
          </Link>
          {flavors?.map((f) => (
            <Link
              key={f.id}
              href={buildUrl(1, f.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                flavorId === f.id
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {f.slug}
            </Link>
          ))}
        </div>
      </div>

      {/* Captions list */}
      {!captions || captions.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700">
          <svg className="w-12 h-12 mx-auto mb-4 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-zinc-400 dark:text-zinc-500 text-sm">No captions found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {captions.map((caption) => {
            const flavor = Array.isArray(caption.humor_flavors)
              ? caption.humor_flavors[0]
              : caption.humor_flavors
            const image = Array.isArray(caption.images)
              ? caption.images[0]
              : caption.images

            return (
              <div
                key={caption.id}
                className="flex gap-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4"
              >
                {/* Image thumbnail */}
                <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  {image?.url ? (
                    <img
                      src={image.url}
                      alt="Caption image"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300 dark:text-zinc-600">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-900 dark:text-zinc-100 leading-relaxed">
                    {caption.content ?? '—'}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    {flavor?.slug && (
                      <Link
                        href={buildUrl(1, flavor.id)}
                        className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      >
                        {flavor.slug}
                      </Link>
                    )}
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                      {caption.created_datetime_utc
                        ? new Date(caption.created_datetime_utc).toLocaleString()
                        : '—'}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {page > 1 && (
            <Link
              href={buildUrl(page - 1, flavorId)}
              className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Previous
            </Link>
          )}
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={buildUrl(page + 1, flavorId)}
              className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { AnimatedPage } from '@/components/AnimatedPage'
import { CaptionCard } from '@/components/CaptionCard'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 20

interface PageProps {
  searchParams: Promise<{ page?: string; flavor?: string }>
}

function buildUrl(p: number, f?: number | null) {
  const params = new URLSearchParams()
  if (p > 1) params.set('page', String(p))
  if (f) params.set('flavor', String(f))
  const qs = params.toString()
  return `/captions${qs ? `?${qs}` : ''}`
}

function PaginationNumbers({
  page,
  totalPages,
  flavorId,
}: {
  page: number
  totalPages: number
  flavorId: number | null
}) {
  const pages: (number | '...')[] = []

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 4) pages.push('...')
    for (let i = Math.max(2, page - 2); i <= Math.min(totalPages - 1, page + 2); i++) {
      pages.push(i)
    }
    if (page < totalPages - 3) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-8 flex-wrap">
      {page > 1 && (
        <Link
          href={buildUrl(page - 1, flavorId)}
          className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
        >
          Previous
        </Link>
      )}
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-zinc-400 dark:text-zinc-500 text-sm">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildUrl(p, flavorId)}
            className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
              p === page
                ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm shadow-indigo-500/30'
                : 'border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700'
            }`}
          >
            {p}
          </Link>
        )
      )}
      {page < totalPages && (
        <Link
          href={buildUrl(page + 1, flavorId)}
          className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
        >
          Next
        </Link>
      )}
    </div>
  )
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

  return (
    <AnimatedPage>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Captions</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              {count ?? 0} caption{count !== 1 ? 's' : ''} total
            </p>
          </div>
        </div>

        {/* Filter — horizontal scroll on mobile to prevent overflow */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 mb-6">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
            Filter by flavor
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <Link
              href={buildUrl(1, null)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                !flavorId
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm shadow-indigo-500/30'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              All
            </Link>
            {flavors?.map((f) => (
              <Link
                key={f.id}
                href={buildUrl(1, f.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  flavorId === f.id
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm shadow-indigo-500/30'
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
            {captions.map((caption, index) => {
              const flavor = Array.isArray(caption.humor_flavors)
                ? caption.humor_flavors[0]
                : caption.humor_flavors
              const image = Array.isArray(caption.images)
                ? caption.images[0]
                : caption.images

              return (
                <CaptionCard key={caption.id} index={index}>
                <div
                  className="flex gap-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 transition-all hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900 hover:-translate-y-0.5 duration-200"
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
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {flavor?.slug && (
                        <Link
                          href={buildUrl(1, flavor.id)}
                          className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950 transition-colors"
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
                </CaptionCard>
              )
            })}
          </div>
        )}

        {totalPages > 1 && (
          <PaginationNumbers page={page} totalPages={totalPages} flavorId={flavorId} />
        )}
      </div>
    </AnimatedPage>
  )
}

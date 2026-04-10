import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { AnimatedPage } from '@/components/AnimatedPage'
import { AppShell } from '@/components/AppShell'
import { CaptionCard } from '@/components/CaptionCard'
import { PageHeader } from '@/components/PageHeader'

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
          className="px-3 py-2 rounded-[16px] bg-[#e5e5e0] dark:bg-[#3e3e39] text-sm text-[#211922] dark:text-[#f6f6f3] hover:bg-[#d5d5d0] dark:hover:bg-[#4a4a44] transition-colors"
        >
          Previous
        </Link>
      )}
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-[#91918c] text-sm">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildUrl(p, flavorId)}
            className={`w-9 h-9 flex items-center justify-center rounded-[16px] text-sm font-medium transition-colors ${
              p === page
                ? 'bg-[#e60023] text-white'
                : 'bg-[#e5e5e0] dark:bg-[#3e3e39] text-[#211922] dark:text-[#f6f6f3] hover:bg-[#d5d5d0] dark:hover:bg-[#4a4a44]'
            }`}
          >
            {p}
          </Link>
        )
      )}
      {page < totalPages && (
        <Link
          href={buildUrl(page + 1, flavorId)}
          className="px-3 py-2 rounded-[16px] bg-[#e5e5e0] dark:bg-[#3e3e39] text-sm text-[#211922] dark:text-[#f6f6f3] hover:bg-[#d5d5d0] dark:hover:bg-[#4a4a44] transition-colors"
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
      'id, content, created_datetime_utc, humor_flavor_id, image_id, caption_request_id, llm_prompt_chain_id, humor_flavors(id, slug), images(id, url)',
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
      <AppShell>
        <div className="space-y-8">
          <PageHeader
            eyebrow="Results Archive"
            title="Captions"
            description="Browse saved caption outputs, filter by humor flavor, and inspect prompt-chain metadata tied to each generation."
            badge={`${count ?? 0} total`}
          />

          <div className="glass-surface rounded-[26px] p-4">
            <div className="mb-3 flex items-center justify-between gap-4">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#91918c]">
                Filter by flavor
              </p>
              <span className="text-xs text-[#91918c]">
                {flavorId ? 'Focused view' : 'All flavors'}
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <Link
                href={buildUrl(1, null)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-[16px] text-sm font-medium transition-colors whitespace-nowrap ${
                  !flavorId
                    ? 'bg-[#e60023] text-white'
                    : 'bg-[#e5e5e0] dark:bg-[#3e3e39] text-[#211922] dark:text-[#f6f6f3] hover:bg-[#d5d5d0] dark:hover:bg-[#4a4a44]'
                }`}
              >
                All
              </Link>
              {flavors?.map((f) => (
                <Link
                  key={f.id}
                  href={buildUrl(1, f.id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-[16px] text-sm font-medium transition-colors whitespace-nowrap ${
                    flavorId === f.id
                      ? 'bg-[#e60023] text-white'
                      : 'bg-[#e5e5e0] dark:bg-[#3e3e39] text-[#211922] dark:text-[#f6f6f3] hover:bg-[#d5d5d0] dark:hover:bg-[#4a4a44]'
                  }`}
                >
                  {f.slug}
                </Link>
              ))}
            </div>
          </div>

          {!captions || captions.length === 0 ? (
            <div className="glass-surface rounded-[28px] border-dashed p-16 text-center">
              <svg className="mx-auto mb-4 h-12 w-12 text-[#91918c] dark:text-[#62625b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm text-[#91918c]">No captions found for this filter.</p>
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
                    className="glass-surface flex gap-4 rounded-[20px] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#e60023]/30 dark:hover:border-[#e60023]/20"
                  >
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-[16px] bg-[#e5e5e0] dark:bg-[#3e3e39]">
                      {image?.url ? (
                        <img
                          src={image.url}
                          alt="Caption image"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#91918c] dark:text-[#62625b]">
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-7 text-[#211922] dark:text-[#f6f6f3]">
                        {caption.content ?? '—'}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {flavor?.slug && (
                          <Link
                            href={buildUrl(1, flavor.id)}
                            className="inline-flex items-center rounded-full bg-[#e60023]/8 px-3 py-1 text-xs font-medium text-[#e60023] transition-colors hover:bg-[#e60023]/15 dark:bg-[#e60023]/15 dark:text-[#ff4d6a]"
                          >
                            {flavor.slug}
                          </Link>
                        )}
                        <span className="rounded-full bg-[#e5e5e0] px-3 py-1 text-xs text-[#62625b] dark:bg-[#3e3e39] dark:text-[#b4b4ad]">
                          {caption.created_datetime_utc
                            ? new Date(caption.created_datetime_utc).toLocaleString()
                            : '—'}
                        </span>
                        {caption.caption_request_id !== null && (
                          <span className="rounded-full bg-[#e5e5e0] px-3 py-1 text-xs text-[#62625b] dark:bg-[#3e3e39] dark:text-[#b4b4ad]">
                            request #{caption.caption_request_id}
                          </span>
                        )}
                        {caption.llm_prompt_chain_id !== null && (
                          <span className="rounded-full bg-[#e5e5e0] px-3 py-1 text-xs text-[#62625b] dark:bg-[#3e3e39] dark:text-[#b4b4ad]">
                            chain #{caption.llm_prompt_chain_id}
                          </span>
                        )}
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
      </AppShell>
    </AnimatedPage>
  )
}

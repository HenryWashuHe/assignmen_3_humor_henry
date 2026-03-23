import { createClient } from '@/lib/supabase-server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { FlavorForm } from '@/components/FlavorForm'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditFlavorPage({ params }: PageProps) {
  const { id } = await params
  const flavorId = Number(id)

  if (isNaN(flavorId)) notFound()

  const supabase = await createClient()
  const { data: flavor, error } = await supabase
    .from('humor_flavors')
    .select('id, slug, description, created_datetime_utc')
    .eq('id', flavorId)
    .single()

  if (error || !flavor) notFound()

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <Link
          href={`/flavors/${flavorId}`}
          className="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Flavor
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Edit Flavor</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Editing: <span className="font-medium">{flavor.slug}</span>
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
        <FlavorForm
          flavorId={flavorId}
          initialValues={{ slug: flavor.slug, description: flavor.description ?? '' }}
        />
      </div>
    </div>
  )
}

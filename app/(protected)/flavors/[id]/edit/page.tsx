import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import { AnimatedPage } from '@/components/AnimatedPage'
import { AppShell } from '@/components/AppShell'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { PageHeader } from '@/components/PageHeader'
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
    <AnimatedPage>
      <AppShell className="max-w-4xl">
        <div className="mb-6">
          <Breadcrumbs items={[{ label: 'Flavors', href: '/flavors' }, { label: flavor.slug, href: `/flavors/${flavorId}` }, { label: 'Edit' }]} />
        </div>

        <PageHeader
          eyebrow="Refine"
          title="Edit Flavor"
          description={`Update the identity and description for ${flavor.slug} without changing its step pipeline.`}
          badge={flavor.slug}
          className="mb-8"
        />

        <div className="glass-surface rounded-[28px] p-6">
          <FlavorForm
            flavorId={flavorId}
            initialValues={{ slug: flavor.slug, description: flavor.description ?? '' }}
          />
        </div>
      </AppShell>
    </AnimatedPage>
  )
}

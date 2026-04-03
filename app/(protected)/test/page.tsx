import { createClient } from '@/lib/supabase-server'
import { AnimatedPage } from '@/components/AnimatedPage'
import { AppShell } from '@/components/AppShell'
import { PageHeader } from '@/components/PageHeader'
import { TestFlavorClient } from './TestFlavorClient'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ flavor?: string }>
}

export default async function TestPage({ searchParams }: PageProps) {
  const { flavor: flavorParam } = await searchParams
  const supabase = await createClient()

  const [{ data: flavors }, { data: imageSets }] = await Promise.all([
    supabase.from('humor_flavors').select('id, slug').order('slug'),
    supabase.from('study_image_sets').select('id, slug, description').order('slug'),
  ])

  return (
    <AnimatedPage>
      <AppShell>
        <div className="space-y-8">
          <PageHeader
            eyebrow="Evaluation"
            title="Test Flavor"
            description="Run a flavor against one image or a full study set, watch generation progress, and inspect the saved caption outputs."
            badge={`${flavors?.length ?? 0} flavors available`}
          />

          <TestFlavorClient
            flavors={flavors ?? []}
            imageSets={imageSets ?? []}
            initialFlavorId={flavorParam}
          />
        </div>
      </AppShell>
    </AnimatedPage>
  )
}

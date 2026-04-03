import { createClient } from '@/lib/supabase-server'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { AnimatedPage } from '@/components/AnimatedPage'
import { AppShell } from '@/components/AppShell'
import { PageHeader } from '@/components/PageHeader'
import { NewFlavorBuilder } from '@/components/NewFlavorBuilder'

export const dynamic = 'force-dynamic'

export default async function NewFlavorPage() {
  const supabase = await createClient()

  const [
    { data: models },
    { data: inputTypes },
    { data: outputTypes },
    { data: stepTypes },
  ] = await Promise.all([
    supabase.from('llm_models').select('*').order('name'),
    supabase.from('llm_input_types').select('*').order('description'),
    supabase.from('llm_output_types').select('*').order('description'),
    supabase.from('humor_flavor_step_types').select('*').order('slug'),
  ])

  return (
    <AnimatedPage>
      <AppShell className="max-w-6xl">
        <div className="mb-8">
          <Breadcrumbs items={[{ label: 'Flavors', href: '/flavors' }, { label: 'New Flavor' }]} />
        </div>

        <PageHeader
          eyebrow="Create"
          title="New Humor Flavor"
          description="Create the flavor identity and author the full chained prompt pipeline in one pass."
          badge="Pipeline builder"
          className="mb-8"
        />

        <NewFlavorBuilder
          models={models ?? []}
          inputTypes={inputTypes ?? []}
          outputTypes={outputTypes ?? []}
          stepTypes={stepTypes ?? []}
        />
      </AppShell>
    </AnimatedPage>
  )
}

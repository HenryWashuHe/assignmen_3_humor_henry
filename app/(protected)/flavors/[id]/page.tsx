import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import { StepList } from '@/components/StepList'
import { StepPipelineViz } from '@/components/StepPipelineViz'
import { AnimatedPage } from '@/components/AnimatedPage'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { FlavorDetailClient } from './FlavorDetailClient'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ new?: string }>
}

export default async function FlavorDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { new: isNew } = await searchParams
  const flavorId = Number(id)

  if (isNaN(flavorId)) notFound()

  const supabase = await createClient()

  const [
    { data: flavor, error: flavorError },
    { data: steps },
    { data: models },
    { data: inputTypes },
    { data: outputTypes },
    { data: stepTypes },
  ] = await Promise.all([
    supabase
      .from('humor_flavors')
      .select('id, slug, description, created_datetime_utc')
      .eq('id', flavorId)
      .single(),
    supabase
      .from('humor_flavor_steps')
      .select('*')
      .eq('humor_flavor_id', flavorId)
      .order('order_by', { ascending: true }),
    supabase.from('llm_models').select('*').order('name'),
    supabase.from('llm_input_types').select('*').order('description'),
    supabase.from('llm_output_types').select('*').order('description'),
    supabase.from('humor_flavor_step_types').select('*').order('slug'),
  ])

  if (flavorError || !flavor) notFound()

  const pipelineSteps = (steps ?? []).map((s) => ({
    id: s.id,
    order_by: s.order_by,
    description: s.description,
  }))

  return (
    <AnimatedPage>
      <div className="p-8">
        <div className="mb-6">
          <Breadcrumbs items={[{ label: 'Flavors', href: '/flavors' }, { label: flavor.slug }]} />
        </div>

        <FlavorDetailClient flavor={flavor} />

        {pipelineSteps.length > 0 && (
          <div className="mt-6">
            <StepPipelineViz steps={pipelineSteps} />
          </div>
        )}

        <div className="mt-8">
          <StepList
            flavorId={flavorId}
            initialSteps={steps ?? []}
            models={models ?? []}
            inputTypes={inputTypes ?? []}
            outputTypes={outputTypes ?? []}
            stepTypes={stepTypes ?? []}
            isNewFlavor={isNew === 'true'}
          />
        </div>
      </div>
    </AnimatedPage>
  )
}

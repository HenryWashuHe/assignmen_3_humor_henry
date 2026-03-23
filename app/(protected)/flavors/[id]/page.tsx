import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { StepList } from '@/components/StepList'
import { StepPipelineViz } from '@/components/StepPipelineViz'
import { AnimatedPage } from '@/components/AnimatedPage'
import { FlavorDetailClient } from './FlavorDetailClient'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function FlavorDetailPage({ params }: PageProps) {
  const { id } = await params
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
          <Link
            href="/flavors"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Flavors
          </Link>
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
          />
        </div>
      </div>
    </AnimatedPage>
  )
}

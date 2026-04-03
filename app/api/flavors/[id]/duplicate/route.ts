import { createClient } from '@/lib/supabase-server'
import { NextResponse, type NextRequest } from 'next/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

interface DuplicableFlavorStep {
  order_by: number
  description: string | null
  llm_system_prompt: string | null
  llm_user_prompt: string | null
  llm_model_id: number | null
  llm_temperature: number | null
  llm_input_type_id: number | null
  llm_output_type_id: number | null
  humor_flavor_step_type_id: number | null
}

function getDuplicateSlug(sourceSlug: string, existingSlugs: string[]) {
  const baseSlug = `${sourceSlug}-copy`

  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug
  }

  let suffix = 2
  while (existingSlugs.includes(`${baseSlug}-${suffix}`)) {
    suffix += 1
  }

  return `${baseSlug}-${suffix}`
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const flavorId = Number(id)

    if (Number.isNaN(flavorId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid flavor id' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const [
      { data: sourceFlavor, error: sourceFlavorError },
      { data: sourceSteps, error: sourceStepsError },
    ] = await Promise.all([
      supabase
        .from('humor_flavors')
        .select('id, slug, description')
        .eq('id', flavorId)
        .single(),
      supabase
        .from('humor_flavor_steps')
        .select(
          [
            'order_by',
            'description',
            'llm_system_prompt',
            'llm_user_prompt',
            'llm_model_id',
            'llm_temperature',
            'llm_input_type_id',
            'llm_output_type_id',
            'humor_flavor_step_type_id',
          ].join(', ')
        )
        .eq('humor_flavor_id', flavorId)
        .order('order_by', { ascending: true }),
    ])

    if (sourceFlavorError) throw new Error(sourceFlavorError.message)
    if (sourceStepsError) throw new Error(sourceStepsError.message)

    if (!sourceFlavor) {
      return NextResponse.json(
        { success: false, error: 'Flavor not found' },
        { status: 404 }
      )
    }

    const baseSlug = `${sourceFlavor.slug}-copy`
    const { data: similarFlavors, error: similarFlavorsError } = await supabase
      .from('humor_flavors')
      .select('slug')
      .like('slug', `${baseSlug}%`)

    if (similarFlavorsError) throw new Error(similarFlavorsError.message)

    const duplicateSlug = getDuplicateSlug(
      sourceFlavor.slug,
      (similarFlavors ?? []).map((flavor) => flavor.slug)
    )

    const { data: newFlavor, error: newFlavorError } = await supabase
      .from('humor_flavors')
      .insert({
        slug: duplicateSlug,
        description: sourceFlavor.description,
      })
      .select('id, slug, description, created_datetime_utc')
      .single()

    if (newFlavorError) throw new Error(newFlavorError.message)

    const stepsToDuplicate = ((sourceSteps ?? []) as unknown) as DuplicableFlavorStep[]

    if (stepsToDuplicate.length > 0) {
      const { error: insertStepsError } = await supabase
        .from('humor_flavor_steps')
        .insert(
          stepsToDuplicate.map((step) => ({
            humor_flavor_id: newFlavor.id,
            order_by: step.order_by,
            description: step.description,
            llm_system_prompt: step.llm_system_prompt,
            llm_user_prompt: step.llm_user_prompt,
            llm_model_id: step.llm_model_id,
            llm_temperature: step.llm_temperature,
            llm_input_type_id: step.llm_input_type_id,
            llm_output_type_id: step.llm_output_type_id,
            humor_flavor_step_type_id: step.humor_flavor_step_type_id,
          }))
        )

      if (insertStepsError) throw new Error(insertStepsError.message)
    }

    return NextResponse.json({ success: true, data: newFlavor }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

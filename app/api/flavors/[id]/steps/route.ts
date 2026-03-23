import { createClient } from '@/lib/supabase-server'
import { NextResponse, type NextRequest } from 'next/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('humor_flavor_steps')
      .select('*')
      .eq('humor_flavor_id', Number(id))
      .order('order_by', { ascending: true })

    if (error) throw new Error(error.message)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const flavorId = Number(id)
    const supabase = await createClient()
    const body = await request.json()

    // Get current max order_by
    const { data: existingSteps } = await supabase
      .from('humor_flavor_steps')
      .select('order_by')
      .eq('humor_flavor_id', flavorId)
      .order('order_by', { ascending: false })
      .limit(1)

    const nextOrderBy = (existingSteps?.[0]?.order_by ?? 0) + 1

    const { data, error } = await supabase
      .from('humor_flavor_steps')
      .insert({
        humor_flavor_id: flavorId,
        order_by: nextOrderBy,
        description: body.description?.trim() ?? null,
        llm_system_prompt: body.llm_system_prompt?.trim() ?? null,
        llm_user_prompt: body.llm_user_prompt?.trim() ?? null,
        llm_model_id: body.llm_model_id ?? null,
        llm_temperature: body.llm_temperature ?? null,
        llm_input_type_id: body.llm_input_type_id ?? null,
        llm_output_type_id: body.llm_output_type_id ?? null,
        humor_flavor_step_type_id: body.humor_flavor_step_type_id ?? null,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

import { createClient } from '@/lib/supabase-server'
import { NextResponse, type NextRequest } from 'next/server'

interface RouteContext {
  params: Promise<{ id: string; stepId: string }>
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id, stepId } = await context.params
    const supabase = await createClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from('humor_flavor_steps')
      .update({
        description: body.description?.trim() ?? null,
        llm_system_prompt: body.llm_system_prompt?.trim() ?? null,
        llm_user_prompt: body.llm_user_prompt?.trim() ?? null,
        llm_model_id: body.llm_model_id ?? null,
        llm_temperature: body.llm_temperature ?? null,
        llm_input_type_id: body.llm_input_type_id ?? null,
        llm_output_type_id: body.llm_output_type_id ?? null,
        humor_flavor_step_type_id: body.humor_flavor_step_type_id ?? null,
      })
      .eq('id', Number(stepId))
      .eq('humor_flavor_id', Number(id))
      .select()
      .single()

    if (error) throw new Error(error.message)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id, stepId } = await context.params
    const supabase = await createClient()

    const { error } = await supabase
      .from('humor_flavor_steps')
      .delete()
      .eq('id', Number(stepId))
      .eq('humor_flavor_id', Number(id))

    if (error) throw new Error(error.message)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

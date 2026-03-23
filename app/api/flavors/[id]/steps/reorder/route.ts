import { createClient } from '@/lib/supabase-server'
import { NextResponse, type NextRequest } from 'next/server'
import { ReorderStepsPayload } from '@/lib/types'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const body: ReorderStepsPayload = await request.json()

    if (!Array.isArray(body.steps) || body.steps.length === 0) {
      return NextResponse.json(
        { success: false, error: 'steps array is required' },
        { status: 400 }
      )
    }

    // Update each step's order_by value
    const updates = body.steps.map((step) =>
      supabase
        .from('humor_flavor_steps')
        .update({ order_by: step.order_by })
        .eq('id', step.id)
        .eq('humor_flavor_id', Number(id))
    )

    const results = await Promise.all(updates)

    const firstError = results.find((r) => r.error)?.error
    if (firstError) throw new Error(firstError.message)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

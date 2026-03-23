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
      .from('humor_flavors')
      .select('id, slug, description, created_datetime_utc')
      .eq('id', Number(id))
      .single()

    if (error) throw new Error(error.message)
    if (!data) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const body = await request.json()

    if (!body.slug?.trim()) {
      return NextResponse.json({ success: false, error: 'Slug is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('humor_flavors')
      .update({ slug: body.slug.trim(), description: body.description?.trim() ?? null })
      .eq('id', Number(id))
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
    const { id } = await context.params
    const supabase = await createClient()

    const { error } = await supabase
      .from('humor_flavors')
      .delete()
      .eq('id', Number(id))

    if (error) throw new Error(error.message)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

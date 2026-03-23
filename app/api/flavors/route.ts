import { createClient } from '@/lib/supabase-server'
import { NextResponse, type NextRequest } from 'next/server'
import { CreateFlavorPayload } from '@/lib/types'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('humor_flavors')
      .select('id, slug, description, created_datetime_utc')
      .order('created_datetime_utc', { ascending: false })

    if (error) throw new Error(error.message)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body: CreateFlavorPayload = await request.json()

    if (!body.slug?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Slug is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('humor_flavors')
      .insert({ slug: body.slug.trim(), description: body.description?.trim() ?? null })
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

import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data, error } = await supabase
      .from('captions')
      .select('created_datetime_utc')
      .gte('created_datetime_utc', thirtyDaysAgo.toISOString())
      .order('created_datetime_utc', { ascending: true })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Group by date
    const countsByDate: Record<string, number> = {}
    for (const row of data ?? []) {
      if (!row.created_datetime_utc) continue
      const date = new Date(row.created_datetime_utc).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
      countsByDate[date] = (countsByDate[date] ?? 0) + 1
    }

    const result = Object.entries(countsByDate).map(([date, count]) => ({
      date,
      count,
    }))

    return NextResponse.json({ success: true, data: result })
  } catch (err) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

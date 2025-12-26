import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

// GET /api/users/classes/[classId] - Get specific class
export async function GET(
  request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params

    const { data, error } = await supabaseAdmin
      .from('classes')
      .select('*, instructors(*)')
      .eq('class_id', classId)
      .single()

    if (error) {
      console.error('[GET /api/users/classes/[id]] Error:', error)
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      )
    }

    // Increment view count
    await supabaseAdmin
      .from('classes')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('class_id', classId)

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('[GET /api/users/classes/[id]] Unexpected error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

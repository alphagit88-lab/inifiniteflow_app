import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ocfufnbhqxzwsrxxulup.supabase.co'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZnVmbmJocXh6d3NyeHh1bHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzMzMTQ0NywiZXhwIjoyMDc4OTA3NDQ3fQ.B9JSyL6eTg99732hPbUFazai3tLwqGMf2j9zxUx7mfo'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

// GET /api/users/classes - Get classes for user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const level = searchParams.get('level')
    const search = searchParams.get('search')
    const limit = searchParams.get('limit') || '20'
    const page = searchParams.get('page') || '1'
    const isPremium = searchParams.get('isPremium')
    const instructorId = searchParams.get('instructorId')

    let query = supabaseAdmin
      .from('classes')
      .select('*', { count: 'exact' })
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    if (level) {
      query = query.eq('level', level)
    }

    if (search) {
      query = query.or(`class_name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (isPremium !== null && isPremium !== undefined) {
      query = query.eq('is_premium', isPremium === 'true')
    }

    if (instructorId) {
      query = query.eq('instructor_id', instructorId)
    }

    // Pagination
    const limitNum = parseInt(limit)
    const pageNum = parseInt(page)
    const offset = (pageNum - 1) * limitNum
    query = query.range(offset, offset + limitNum - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('[GET /api/users/classes] Error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch classes' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count
      }
    })
  } catch (error) {
    console.error('[GET /api/users/classes] Unexpected error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

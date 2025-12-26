import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

// GET /api/users/meals - Get meals/recipes
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const limit = searchParams.get('limit') || '20'
    const page = searchParams.get('page') || '1'
    const isPremium = searchParams.get('isPremium')

    let query = supabaseAdmin
      .from('recipes')
      .select('*', { count: 'exact' })
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    if (category) {
      query = query.ilike('class_name', `%${category}%`)
    }

    if (search) {
      query = query.or(`recipe_name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (isPremium !== null) {
      query = query.eq('is_premium', isPremium === 'true')
    }

    // Pagination
    const limitNum = parseInt(limit)
    const pageNum = parseInt(page)
    const offset = (pageNum - 1) * limitNum
    query = query.range(offset, offset + limitNum - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('[GET /api/users/meals] Error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch meals' },
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
    console.error('[GET /api/users/meals] Unexpected error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

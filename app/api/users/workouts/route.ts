import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ocfufnbhqxzwsrxxulup.supabase.co'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZnVmbmJocXh6d3NyeHh1bHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzMzMTQ0NywiZXhwIjoyMDc4OTA3NDQ3fQ.B9JSyL6eTg99732hPbUFazai3tLwqGMf2j9zxUx7mfo'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

// GET /api/users/workouts - Get user workouts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const classId = searchParams.get('classId')
    const limit = searchParams.get('limit') || '20'
    const page = searchParams.get('page') || '1'

    let query = supabaseAdmin
      .from('workout')
      .select('*, classes(*)')
      .order('completed_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (classId) {
      query = query.eq('class_id', classId)
    }

    // Pagination
    const limitNum = parseInt(limit)
    const pageNum = parseInt(page)
    const offset = (pageNum - 1) * limitNum
    query = query.range(offset, offset + limitNum - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('[GET /api/users/workouts] Error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch workouts' },
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
    console.error('[GET /api/users/workouts] Unexpected error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// POST /api/users/workouts - Log a new workout
export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const { 
      user_id, 
      class_id, 
      duration_minutes, 
      difficulty_rating,
      mood_before,
      mood_after,
      notes,
      calories_burned 
    } = payload

    if (!user_id || !class_id) {
      return NextResponse.json(
        { error: 'user_id and class_id are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('workout')
      .insert({
        user_id,
        class_id,
        duration_minutes,
        difficulty_rating,
        mood_before,
        mood_after,
        notes,
        calories_burned,
        completed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('[POST /api/users/workouts] Error:', error)
      return NextResponse.json(
        { error: 'Failed to log workout' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/users/workouts] Unexpected error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

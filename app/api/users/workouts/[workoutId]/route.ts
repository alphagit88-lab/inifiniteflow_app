import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ocfufnbhqxzwsrxxulup.supabase.co'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZnVmbmJocXh6d3NyeHh1bHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzMzMTQ0NywiZXhwIjoyMDc4OTA3NDQ3fQ.B9JSyL6eTg99732hPbUFazai3tLwqGMf2j9zxUx7mfo'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

// GET /api/users/workouts/[workoutId] - Get specific workout
export async function GET(
  request: Request,
  { params }: { params: Promise<{ workoutId: string }> }
) {
  try {
    const { workoutId } = await params

    const { data, error } = await supabaseAdmin
      .from('workout')
      .select('*, classes(*)')
      .eq('log_id', workoutId)
      .single()

    if (error) {
      console.error('[GET /api/users/workouts/[id]] Error:', error)
      return NextResponse.json(
        { error: 'Workout not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('[GET /api/users/workouts/[id]] Unexpected error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// PUT /api/users/workouts/[workoutId] - Update workout
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ workoutId: string }> }
) {
  try {
    const { workoutId } = await params
    const payload = await request.json()

    const allowedFields = [
      'duration_minutes',
      'difficulty_rating',
      'mood_before',
      'mood_after',
      'notes',
      'calories_burned'
    ]

    const updateData: Record<string, any> = {}
    Object.keys(payload).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = payload[key]
      }
    })

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('workout')
      .update(updateData)
      .eq('log_id', workoutId)
      .select()
      .single()

    if (error) {
      console.error('[PUT /api/users/workouts/[id]] Error:', error)
      return NextResponse.json(
        { error: 'Failed to update workout' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('[PUT /api/users/workouts/[id]] Unexpected error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/workouts/[workoutId] - Delete workout
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ workoutId: string }> }
) {
  try {
    const { workoutId } = await params

    const { error } = await supabaseAdmin
      .from('workout')
      .delete()
      .eq('log_id', workoutId)

    if (error) {
      console.error('[DELETE /api/users/workouts/[id]] Error:', error)
      return NextResponse.json(
        { error: 'Failed to delete workout' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Workout deleted successfully'
    })
  } catch (error) {
    console.error('[DELETE /api/users/workouts/[id]] Unexpected error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

// GET /api/users/progress - Get user progress/stats
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const period = searchParams.get('period') || 'week' // week, month, year, all

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Calculate date range
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(0) // All time
    }

    // Get workout stats
    const { data: workouts, error: workoutsError } = await supabaseAdmin
      .from('workout')
      .select('*')
      .eq('user_id', userId)
      .gte('completed_at', startDate.toISOString())
      .order('completed_at', { ascending: false })

    if (workoutsError) {
      console.error('[GET /api/users/progress] Workouts error:', workoutsError)
    }

    // Calculate stats
    const totalWorkouts = workouts?.length || 0
    const totalMinutes = workouts?.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) || 0
    const totalCalories = workouts?.reduce((sum, w) => sum + (w.calories_burned || 0), 0) || 0
    const avgDifficulty = workouts?.length 
      ? workouts.reduce((sum, w) => sum + (w.difficulty_rating || 0), 0) / workouts.length 
      : 0

    // Get streak (consecutive days)
    let streak = 0
    if (workouts && workouts.length > 0) {
      const sortedDates = [...new Set(
        workouts.map(w => new Date(w.completed_at).toDateString())
      )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

      const today = new Date().toDateString()
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()
      
      if (sortedDates[0] === today || sortedDates[0] === yesterday) {
        streak = 1
        for (let i = 1; i < sortedDates.length; i++) {
          const currentDate = new Date(sortedDates[i - 1])
          const prevDate = new Date(sortedDates[i])
          const diffDays = Math.floor((currentDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000))
          
          if (diffDays === 1) {
            streak++
          } else {
            break
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        period,
        totalWorkouts,
        totalMinutes,
        totalCalories,
        avgDifficulty: Math.round(avgDifficulty * 10) / 10,
        streak,
        recentWorkouts: workouts?.slice(0, 5) || []
      }
    })
  } catch (error) {
    console.error('[GET /api/users/progress] Unexpected error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

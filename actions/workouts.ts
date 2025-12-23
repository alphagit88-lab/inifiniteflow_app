'use server'

import { createClient } from '@supabase/supabase-js'

/**
 * Supabase URL and Service Role Key (Admin Access)
 * NOTE: These keys have been hardcoded for demonstrative purposes in this environment,
 * using the values you provided. In a production Next.js environment, these
 * should be loaded securely from environment variables (e.g., .env.local).
 */
const supabaseUrl = 'https://ocfufnbhqxzwsrxxulup.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZnVmbmJocXh6d3NyeHh1bHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzMzMTQ0NywiZXhwIjoyMDc4OTA3NDQ3fQ.B9JSyL6eTg99732hPbUFazai3tLwqGMf2j9zxUx7mfo'

/**
 * Interface representing the essential workout log data fields.
 */
export interface Workout {
  log_id: string
  user_id: string
  class_id: string
  completed_at: string
  duration_minutes: number
  difficulty_rating?: number | null
  mood_before?: string | null
  mood_after?: string | null
  notes?: string | null
  calories_burned?: number | null
}

/**
 * Fetches all workout logs from the database.
 * Uses the Service Role Key to ensure administrative access and bypass RLS.
 *
 * @returns An object containing success status, an array of Workout data, or an error message.
 */
export async function getWorkouts(): Promise<{
  success: boolean
  data: Workout[] | null
  error: string | null
}> {
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

  try {
    const { data, error } = await supabaseAdmin
      .from('workout')
      .select('*')
      .order('completed_at', { ascending: false })

    if (error) {
      console.error('[getWorkouts] Error fetching workouts:', error)
      return { success: false, data: null, error: 'Database query failed (Service Role): ' + error.message }
    }

    const workouts = (data || []) as Workout[]

    return { success: true, data: workouts, error: null }
  } catch (err) {
    console.error('[getWorkouts] Unexpected error:', err)
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'An unknown runtime error occurred while fetching workouts.',
    }
  }
}


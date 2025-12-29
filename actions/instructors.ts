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
 * Interface representing the essential instructor data fields.
 */
export interface Instructor {
  instructor_id: string
  bio: string
  is_featured: boolean
  total_students: number
  total_classes: number
  joined_at: string
  specialization?: string[] | null
  certifications?: string[] | null
  years_experience?: number | null
  profile_video_url?: string | null
  social_media_links?: any | null
  rating?: number | null
}

/**
 * Fetches all instructors from the database.
 * Uses the Service Role Key to ensure administrative access and bypass RLS.
 *
 * @returns An object containing success status, an array of Instructor data, or an error message.
 */
export async function getInstructors(): Promise<{
  success: boolean
  data: Instructor[] | null
  error: string | null
}> {
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

  try {
    const { data, error } = await supabaseAdmin
      .from('instructor')
      .select('*')
      .order('joined_at', { ascending: false })

    if (error) {
      console.error('[getInstructors] Error fetching instructors:', error)
      return { success: false, data: null, error: 'Database query failed (Service Role): ' + error.message }
    }

    const instructors = (data || []) as Instructor[]

    return { success: true, data: instructors, error: null }
  } catch (err) {
    console.error('[getInstructors] Unexpected error:', err)
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'An unknown runtime error occurred while fetching instructors.',
    }
  }
}


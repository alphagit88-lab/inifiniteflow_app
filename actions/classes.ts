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
 * Interface representing the essential class data fields.
 */
export interface Class {
  class_id: string
  instructor_id: string
  class_name: string
  description: string
  category: string
  level: string
  body_area: string[]
  duration: number
  intensity_level: string
  video_url: string
  thumbnail_image: string
  equipment_list: string[]
  is_premium: boolean
  is_published: boolean
  view_count: number
  completion_count: number
  created_at: string
  updated_at: string
  preview_video_url?: string | null
  image_gallery?: string[] | null
  notes?: string | null
  average_rating?: number | null
  banner_image?: string | null
}

/**
 * Fetches all classes from the database.
 * Uses the Service Role Key to ensure administrative access and bypass RLS.
 *
 * @returns An object containing success status, an array of Class data, or an error message.
 */
export async function getClasses(): Promise<{
  success: boolean
  data: Class[] | null
  error: string | null
}> {
  // Create an Admin client using the Service Role Key (safe because this is a Server Action)
  // This client has full access, bypassing typical RLS policies needed for admin functions.
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

  try {
    // Fetch all classes using the admin client
    const { data, error } = await supabaseAdmin
      .from('classes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[getClasses] Error fetching classes:', error)
      return { success: false, data: null, error: 'Database query failed (Service Role): ' + error.message }
    }

    const classes = (data || []) as Class[]

    return { success: true, data: classes, error: null }
  } catch (err) {
    console.error('[getClasses] Unexpected error:', err)
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'An unknown runtime error occurred while fetching classes.',
    }
  }
}


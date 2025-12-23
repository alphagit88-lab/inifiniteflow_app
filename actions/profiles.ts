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
 * Interface representing the essential profile data fields.
 */
export interface Profile {
  user_id?: string
  nickname: string
  email: string
  user_type: string
  subscription_status: string
  subscription_plan?: number | null
  created_at: string
}

/**
 * Fetches all user profiles from the database that are NOT of type 'A' (Admin).
 * Uses the Service Role Key to ensure administrative access and bypass RLS.
 *
 * @returns An object containing success status, an array of Profile data, or an error message.
 */
export async function getUserProfiles(): Promise<{
  success: boolean
  data: Profile[] | null
  error: string | null
}> {
  // Create an Admin client using the Service Role Key (safe because this is a Server Action)
  // This client has full access, bypassing typical RLS policies needed for admin functions.
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

  try {
    // Fetch all non-admin users using the admin client
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('user_id, nickname, email, user_type, subscription_status, subscription_plan, created_at')
      // Assuming 'A' is the value for Admin users you want to exclude
      .neq('user_type', 'A')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[getUserProfiles] Error fetching profiles:', error)
      return { success: false, data: null, error: 'Database query failed (Service Role): ' + error.message }
    }

    const profiles = (data || []) as Profile[]

    return { success: true, data: profiles, error: null }
  } catch (err) {
    console.error('[getUserProfiles] Unexpected error:', err)
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'An unknown runtime error occurred while fetching profiles.',
    }
  }
}
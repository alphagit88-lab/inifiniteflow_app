'use server'

import { createClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/supabaseClient'

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
 * Full profile interface matching the database schema
 */
export interface FullProfile {
  user_id: string
  email: string
  first_name: string
  last_name: string
  user_type: string
  nickname: string
  profile_picture: string | null
  date_of_birth: string
  gender: string
  subscription_plan: number
  subscription_status: string
  subscription_start_date: string | null
  subscription_end_date: string | null
  height: number
  height_unit: string
  weight: number
  weight_unit: string
  activity_level: string
  dietary_preference: string
  allergies: string[]
  created_at: string
  updated_at: string
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

/**
 * Gets the current user's profile
 */
export async function getCurrentUserProfile(): Promise<{
  success: boolean
  data: FullProfile | null
  error: string | null
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, data: null, error: 'User not authenticated' }
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('[getCurrentUserProfile] Error fetching profile:', error)
      return { success: false, data: null, error: 'Failed to fetch profile: ' + error.message }
    }

    return { success: true, data: data as FullProfile, error: null }
  } catch (err) {
    console.error('[getCurrentUserProfile] Unexpected error:', err)
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'An unknown runtime error occurred.',
    }
  }
}

/**
 * Updates the current user's profile
 */
export async function updateUserProfile(updates: Partial<FullProfile>): Promise<{
  success: boolean
  data: FullProfile | null
  error: string | null
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, data: null, error: 'User not authenticated' }
    }

    // Remove fields that shouldn't be updated directly
    const { user_id, email, user_type, created_at, subscription_plan, subscription_status, subscription_start_date, subscription_end_date, ...allowedUpdates } = updates

    const updateData = {
      ...allowedUpdates,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('[updateUserProfile] Error updating profile:', error)
      return { success: false, data: null, error: 'Failed to update profile: ' + error.message }
    }

    return { success: true, data: data as FullProfile, error: null }
  } catch (err) {
    console.error('[updateUserProfile] Unexpected error:', err)
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'An unknown runtime error occurred.',
    }
  }
}
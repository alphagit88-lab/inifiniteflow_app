'use server'

import { createClient } from '@supabase/supabase-js'

/**
 * Supabase URL and Service Role Key (Admin Access)
 */
const supabaseUrl = 'https://ocfufnbhqxzwsrxxulup.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZnVmbmJocXh6d3NyeHh1bHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzMzMTQ0NywiZXhwIjoyMDc4OTA3NDQ3fQ.B9JSyL6eTg99732hPbUFazai3tLwqGMf2j9zxUx7mfo'

/**
 * Interface representing recipe banner data fields.
 */
export interface RecipeBanner {
  banner_id: string
  image_url: string
  title: string | null
  subtitle: string | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

/**
 * Fetches all recipe banners from the database.
 * Uses the Service Role Key to ensure administrative access and bypass RLS.
 *
 * @returns An object containing success status, an array of RecipeBanner data, or an error message.
 */
export async function getRecipeBanners(): Promise<{
  success: boolean
  data: RecipeBanner[] | null
  error: string | null
}> {
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

  try {
    const { data, error } = await supabaseAdmin
      .from('recipe_banners')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      console.error('[getRecipeBanners] Error fetching banners:', error)
      return { success: false, data: null, error: 'Database query failed (Service Role): ' + error.message }
    }

    const banners = (data || []) as RecipeBanner[]

    return { success: true, data: banners, error: null }
  } catch (err) {
    console.error('[getRecipeBanners] Unexpected error:', err)
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'An unknown runtime error occurred while fetching banners.',
    }
  }
}


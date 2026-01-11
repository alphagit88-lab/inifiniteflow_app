'use server'

import { createClient } from '@supabase/supabase-js'

/**
 * Supabase URL and Service Role Key (Admin Access)
 */
const supabaseUrl = 'https://ocfufnbhqxzwsrxxulup.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZnVmbmJocXh6d3NyeHh1bHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzMzMTQ0NywiZXhwIjoyMDc4OTA3NDQ3fQ.B9JSyL6eTg99732hPbUFazai3tLwqGMf2j9zxUx7mfo'

/**
 * Interface representing help FAQ data fields.
 */
export interface HelpFaq {
  id: string
  question: string
  answer: string
  display_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

/**
 * Fetches all help FAQs from the database.
 * Uses the Service Role Key to ensure administrative access and bypass RLS.
 *
 * @returns An object containing success status, an array of HelpFaq data, or an error message.
 */
export async function getHelpFaqs(): Promise<{
  success: boolean
  data: HelpFaq[] | null
  error: string | null
}> {
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

  try {
    const { data, error } = await supabaseAdmin
      .from('help_faq')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      console.error('[getHelpFaqs] Error fetching FAQs:', error)
      return { success: false, data: null, error: 'Database query failed (Service Role): ' + error.message }
    }

    const faqs = (data || []) as HelpFaq[]

    return { success: true, data: faqs, error: null }
  } catch (err) {
    console.error('[getHelpFaqs] Unexpected error:', err)
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'An unknown runtime error occurred while fetching FAQs.',
    }
  }
}

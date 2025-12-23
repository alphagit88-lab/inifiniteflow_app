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
 * Interface representing the essential recipe data fields.
 */
export interface Recipe {
  recipe_id: string
  recipe_name: string
  description: string
  prep_time_minutes: number
  cook_time_minutes: number
  servings: number
  difficulty: string
  image_url: string
  ingredients: any[]
  instructions: string[]
  tags: string[]
  is_premium: boolean
  is_published: boolean
  created_at: string
  class_name: string
  calories_per_serving?: number | null
  protein_grams?: number | null
  carbs_grams?: number | null
  fat_grams?: number | null
  fiber_grams?: number | null
}

/**
 * Fetches all recipes from the database.
 * Uses the Service Role Key to ensure administrative access and bypass RLS.
 *
 * @returns An object containing success status, an array of Recipe data, or an error message.
 */
export async function getRecipes(): Promise<{
  success: boolean
  data: Recipe[] | null
  error: string | null
}> {
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

  try {
    const { data, error } = await supabaseAdmin
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[getRecipes] Error fetching recipes:', error)
      return { success: false, data: null, error: 'Database query failed (Service Role): ' + error.message }
    }

    const recipes = (data || []) as Recipe[]

    return { success: true, data: recipes, error: null }
  } catch (err) {
    console.error('[getRecipes] Unexpected error:', err)
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'An unknown runtime error occurred while fetching recipes.',
    }
  }
}


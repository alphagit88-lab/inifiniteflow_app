'use server'

import { createClient } from '@supabase/supabase-js'

/**
 * Get Supabase credentials from environment variables
 */
const supabaseUrl = "https://ocfufnbhqxzwsrxxulup.supabase.co";
const supabaseServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZnVmbmJocXh6d3NyeHh1bHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzMzMTQ0NywiZXhwIjoyMDc4OTA3NDQ3fQ.B9JSyL6eTg99732hPbUFazai3tLwqGMf2j9zxUx7mfo";

/**
 * Interface representing a dietary preference from the database
 */
export interface DietaryPreference {
  preference_id: string
  name: string
  description: string | null
  is_active: boolean
  order_number: number | null
  created_at: string
  updated_at: string
}

/**
 * Interface for creating a dietary preference
 */
export interface CreateDietaryPreferenceParams {
  name: string
  description?: string | null
  is_active?: boolean
  order_number?: number | null
}

/**
 * Interface for updating a dietary preference
 */
export interface UpdateDietaryPreferenceParams {
  preference_id: string
  name?: string
  description?: string | null
  is_active?: boolean
  order_number?: number | null
}

/**
 * Server Action to fetch all dietary preferences from Supabase
 * 
 * @returns An object containing success status, an array of DietaryPreference data, or an error message
 */
export async function getDietaryPreferences(): Promise<{
  success: boolean
  data: DietaryPreference[] | null
  error: string | null
}> {
  try {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return {
        success: false,
        data: null,
        error: 'Supabase credentials are not configured.',
      }
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

    const { data, error } = await supabaseAdmin
      .from('dietary_preferences')
      .select('*')
      .order('order_number', { ascending: true, nullsFirst: false })
      .order('name', { ascending: true })

    if (error) {
      console.error('[getDietaryPreferences] Error fetching dietary preferences:', error)
      return {
        success: false,
        data: null,
        error: 'Database query failed: ' + error.message,
      }
    }

    const dietaryPreferences = (data || []) as DietaryPreference[]

    return { success: true, data: dietaryPreferences, error: null }
  } catch (err) {
    console.error('[getDietaryPreferences] Unexpected error:', err)
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'An unknown error occurred while fetching dietary preferences.',
    }
  }
}

/**
 * Server Action to create a new dietary preference
 * 
 * @param params - The dietary preference data
 * @returns An object containing success status, created DietaryPreference data, or an error message
 */
export async function createDietaryPreference(
  params: CreateDietaryPreferenceParams
): Promise<{
  success: boolean
  data: DietaryPreference | null
  error: string | null
}> {
  try {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return {
        success: false,
        data: null,
        error: 'Supabase credentials are not configured.',
      }
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

    // If order_number is not provided, get the max order_number and add 1
    let orderNumber = params.order_number
    if (orderNumber === undefined || orderNumber === null) {
      const { data: maxOrder } = await supabaseAdmin
        .from('dietary_preferences')
        .select('order_number')
        .order('order_number', { ascending: false })
        .limit(1)
        .single()
      
      orderNumber = maxOrder?.order_number !== null && maxOrder?.order_number !== undefined 
        ? maxOrder.order_number + 1 
        : 0
    }

    const { data: preferenceData, error: insertError } = await supabaseAdmin
      .from('dietary_preferences')
      .insert({
        name: params.name,
        description: params.description || null,
        is_active: params.is_active !== undefined ? params.is_active : true,
        order_number: orderNumber,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error('[createDietaryPreference] Error creating dietary preference:', insertError)
      return {
        success: false,
        data: null,
        error: 'Failed to create dietary preference: ' + insertError.message,
      }
    }

    if (!preferenceData) {
      return {
        success: false,
        data: null,
        error: 'Dietary preference not found after creation.',
      }
    }

    return {
      success: true,
      data: preferenceData as DietaryPreference,
      error: null,
    }
  } catch (err) {
    console.error('[createDietaryPreference] Unexpected error:', err)
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'An unknown error occurred while creating the dietary preference.',
    }
  }
}

/**
 * Server Action to update a dietary preference
 * 
 * @param params - The dietary preference update parameters
 * @returns An object containing success status, updated DietaryPreference data, or an error message
 */
export async function updateDietaryPreference(
  params: UpdateDietaryPreferenceParams
): Promise<{
  success: boolean
  data: DietaryPreference | null
  error: string | null
}> {
  try {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return {
        success: false,
        data: null,
        error: 'Supabase credentials are not configured.',
      }
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Build update object with only provided fields
    const updateData: Partial<DietaryPreference> = {
      updated_at: new Date().toISOString(),
    }

    if (params.name !== undefined) {
      updateData.name = params.name
    }
    if (params.description !== undefined) {
      updateData.description = params.description
    }
    if (params.is_active !== undefined) {
      updateData.is_active = params.is_active
    }
    if (params.order_number !== undefined) {
      updateData.order_number = params.order_number
    }

    const { data: preferenceData, error: updateError } = await supabaseAdmin
      .from('dietary_preferences')
      .update(updateData)
      .eq('preference_id', params.preference_id)
      .select()
      .single()

    if (updateError) {
      console.error('[updateDietaryPreference] Error updating dietary preference:', updateError)
      return {
        success: false,
        data: null,
        error: 'Failed to update dietary preference: ' + updateError.message,
      }
    }

    if (!preferenceData) {
      return {
        success: false,
        data: null,
        error: 'Dietary preference not found after update.',
      }
    }

    return {
      success: true,
      data: preferenceData as DietaryPreference,
      error: null,
    }
  } catch (err) {
    console.error('[updateDietaryPreference] Unexpected error:', err)
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'An unknown error occurred while updating the dietary preference.',
    }
  }
}

/**
 * Server Action to delete a dietary preference
 * 
 * @param preference_id - The dietary preference ID to delete
 * @returns An object containing success status and any errors
 */
export async function deleteDietaryPreference(
  preference_id: string
): Promise<{
  success: boolean
  error: string | null
}> {
  try {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return {
        success: false,
        error: 'Supabase credentials are not configured.',
      }
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

    const { error: deleteError } = await supabaseAdmin
      .from('dietary_preferences')
      .delete()
      .eq('preference_id', preference_id)

    if (deleteError) {
      console.error('[deleteDietaryPreference] Error deleting dietary preference:', deleteError)
      return {
        success: false,
        error: 'Failed to delete dietary preference: ' + deleteError.message,
      }
    }

    return {
      success: true,
      error: null,
    }
  } catch (err) {
    console.error('[deleteDietaryPreference] Unexpected error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unknown error occurred while deleting the dietary preference.',
    }
  }
}

/**
 * Server Action to update order numbers for multiple dietary preferences
 * 
 * @param updates - Array of { preference_id, order_number } pairs
 * @returns An object containing success status and any errors
 */
export async function updateDietaryPreferenceOrder(
  updates: Array<{ preference_id: string; order_number: number }>
): Promise<{
  success: boolean
  error: string | null
}> {
  try {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return {
        success: false,
        error: 'Supabase credentials are not configured.',
      }
    }

    if (!updates || updates.length === 0) {
      return {
        success: false,
        error: 'No updates provided.',
      }
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Update each dietary preference's order_number
    const updatePromises = updates.map((update) =>
      supabaseAdmin
        .from('dietary_preferences')
        .update({
          order_number: update.order_number,
          updated_at: new Date().toISOString(),
        })
        .eq('preference_id', update.preference_id)
    )

    const results = await Promise.all(updatePromises)

    // Check for any errors
    const errors = results.filter((result) => result.error)
    if (errors.length > 0) {
      console.error('[updateDietaryPreferenceOrder] Error updating order:', errors)
      return {
        success: false,
        error: 'Failed to update some dietary preferences: ' + errors.map((e) => e.error?.message).join(', '),
      }
    }

    return {
      success: true,
      error: null,
    }
  } catch (err) {
    console.error('[updateDietaryPreferenceOrder] Unexpected error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unknown error occurred while updating dietary preference order.',
    }
  }
}


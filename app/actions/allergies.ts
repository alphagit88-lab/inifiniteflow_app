'use server'

import { createClient } from '@supabase/supabase-js'

/**
 * Get Supabase credentials from environment variables
 */
const supabaseUrl = "https://ocfufnbhqxzwsrxxulup.supabase.co";
const supabaseServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZnVmbmJocXh6d3NyeHh1bHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzMzMTQ0NywiZXhwIjoyMDc4OTA3NDQ3fQ.B9JSyL6eTg99732hPbUFazai3tLwqGMf2j9zxUx7mfo";

/**
 * Interface representing an allergy from the database
 */
export interface Allergy {
  allergy_id: string
  name: string
  description: string | null
  is_active: boolean
  order_number: number | null
  created_at: string
  updated_at: string
}

/**
 * Interface for creating an allergy
 */
export interface CreateAllergyParams {
  name: string
  description?: string | null
  is_active?: boolean
  order_number?: number | null
}

/**
 * Interface for updating an allergy
 */
export interface UpdateAllergyParams {
  allergy_id: string
  name?: string
  description?: string | null
  is_active?: boolean
  order_number?: number | null
}

/**
 * Server Action to fetch all allergies from Supabase
 * 
 * @returns An object containing success status, an array of Allergy data, or an error message
 */
export async function getAllergies(): Promise<{
  success: boolean
  data: Allergy[] | null
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
      .from('allergies')
      .select('*')
      .order('order_number', { ascending: true, nullsFirst: false })
      .order('name', { ascending: true })

    if (error) {
      console.error('[getAllergies] Error fetching allergies:', error)
      return {
        success: false,
        data: null,
        error: 'Database query failed: ' + error.message,
      }
    }

    const allergies = (data || []) as Allergy[]

    return { success: true, data: allergies, error: null }
  } catch (err) {
    console.error('[getAllergies] Unexpected error:', err)
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'An unknown error occurred while fetching allergies.',
    }
  }
}

/**
 * Server Action to create a new allergy
 * 
 * @param params - The allergy data
 * @returns An object containing success status, created Allergy data, or an error message
 */
export async function createAllergy(
  params: CreateAllergyParams
): Promise<{
  success: boolean
  data: Allergy | null
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
        .from('allergies')
        .select('order_number')
        .order('order_number', { ascending: false })
        .limit(1)
        .single()
      
      orderNumber = maxOrder?.order_number !== null && maxOrder?.order_number !== undefined 
        ? maxOrder.order_number + 1 
        : 0
    }

    const { data: allergyData, error: insertError } = await supabaseAdmin
      .from('allergies')
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
      console.error('[createAllergy] Error creating allergy:', insertError)
      return {
        success: false,
        data: null,
        error: 'Failed to create allergy: ' + insertError.message,
      }
    }

    if (!allergyData) {
      return {
        success: false,
        data: null,
        error: 'Allergy not found after creation.',
      }
    }

    return {
      success: true,
      data: allergyData as Allergy,
      error: null,
    }
  } catch (err) {
    console.error('[createAllergy] Unexpected error:', err)
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'An unknown error occurred while creating the allergy.',
    }
  }
}

/**
 * Server Action to update an allergy
 * 
 * @param params - The allergy update parameters
 * @returns An object containing success status, updated Allergy data, or an error message
 */
export async function updateAllergy(
  params: UpdateAllergyParams
): Promise<{
  success: boolean
  data: Allergy | null
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
    const updateData: Partial<Allergy> = {
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

    const { data: allergyData, error: updateError } = await supabaseAdmin
      .from('allergies')
      .update(updateData)
      .eq('allergy_id', params.allergy_id)
      .select()
      .single()

    if (updateError) {
      console.error('[updateAllergy] Error updating allergy:', updateError)
      return {
        success: false,
        data: null,
        error: 'Failed to update allergy: ' + updateError.message,
      }
    }

    if (!allergyData) {
      return {
        success: false,
        data: null,
        error: 'Allergy not found after update.',
      }
    }

    return {
      success: true,
      data: allergyData as Allergy,
      error: null,
    }
  } catch (err) {
    console.error('[updateAllergy] Unexpected error:', err)
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'An unknown error occurred while updating the allergy.',
    }
  }
}

/**
 * Server Action to delete an allergy
 * 
 * @param allergy_id - The allergy ID to delete
 * @returns An object containing success status and any errors
 */
export async function deleteAllergy(
  allergy_id: string
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
      .from('allergies')
      .delete()
      .eq('allergy_id', allergy_id)

    if (deleteError) {
      console.error('[deleteAllergy] Error deleting allergy:', deleteError)
      return {
        success: false,
        error: 'Failed to delete allergy: ' + deleteError.message,
      }
    }

    return {
      success: true,
      error: null,
    }
  } catch (err) {
    console.error('[deleteAllergy] Unexpected error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unknown error occurred while deleting the allergy.',
    }
  }
}

/**
 * Server Action to update order numbers for multiple allergies
 * 
 * @param updates - Array of { allergy_id, order_number } pairs
 * @returns An object containing success status and any errors
 */
export async function updateAllergyOrder(
  updates: Array<{ allergy_id: string; order_number: number }>
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

    // Update each allergy's order_number
    const updatePromises = updates.map((update) =>
      supabaseAdmin
        .from('allergies')
        .update({
          order_number: update.order_number,
          updated_at: new Date().toISOString(),
        })
        .eq('allergy_id', update.allergy_id)
    )

    const results = await Promise.all(updatePromises)

    // Check for any errors
    const errors = results.filter((result) => result.error)
    if (errors.length > 0) {
      console.error('[updateAllergyOrder] Error updating order:', errors)
      return {
        success: false,
        error: 'Failed to update some allergies: ' + errors.map((e) => e.error?.message).join(', '),
      }
    }

    return {
      success: true,
      error: null,
    }
  } catch (err) {
    console.error('[updateAllergyOrder] Unexpected error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unknown error occurred while updating allergy order.',
    }
  }
}


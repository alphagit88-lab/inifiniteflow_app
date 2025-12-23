'use server'

import { createClient } from '@supabase/supabase-js'

/**
 * Get Supabase credentials from environment variables
 */
const supabaseUrl = "https://ocfufnbhqxzwsrxxulup.supabase.co";
const supabaseServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZnVmbmJocXh6d3NyeHh1bHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzMzMTQ0NywiZXhwIjoyMDc4OTA3NDQ3fQ.B9JSyL6eTg99732hPbUFazai3tLwqGMf2j9zxUx7mfo";

/**
 * Interface representing equipment from the database
 */
export interface Equipment {
  equipment_id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

/**
 * Interface for creating equipment
 */
export interface CreateEquipmentParams {
  name: string
  description?: string | null
  is_active?: boolean
}

/**
 * Interface for updating equipment
 */
export interface UpdateEquipmentParams {
  equipment_id: string
  name?: string
  description?: string | null
  is_active?: boolean
}

/**
 * Server Action to fetch all equipment from Supabase
 * 
 * @returns An object containing success status, an array of Equipment data, or an error message
 */
export async function getEquipment(): Promise<{
  success: boolean
  data: Equipment[] | null
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
      .from('equipment')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('[getEquipment] Error fetching equipment:', error)
      return {
        success: false,
        data: null,
        error: 'Database query failed: ' + error.message,
      }
    }

    const equipment = (data || []) as Equipment[]

    return { success: true, data: equipment, error: null }
  } catch (err) {
    console.error('[getEquipment] Unexpected error:', err)
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'An unknown error occurred while fetching equipment.',
    }
  }
}

/**
 * Server Action to create a new equipment
 * 
 * @param params - The equipment data
 * @returns An object containing success status, created Equipment data, or an error message
 */
export async function createEquipment(
  params: CreateEquipmentParams
): Promise<{
  success: boolean
  data: Equipment | null
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

    const { data: equipmentData, error: insertError } = await supabaseAdmin
      .from('equipment')
      .insert({
        name: params.name,
        description: params.description || null,
        is_active: params.is_active !== undefined ? params.is_active : true,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error('[createEquipment] Error creating equipment:', insertError)
      return {
        success: false,
        data: null,
        error: 'Failed to create equipment: ' + insertError.message,
      }
    }

    if (!equipmentData) {
      return {
        success: false,
        data: null,
        error: 'Equipment not found after creation.',
      }
    }

    return {
      success: true,
      data: equipmentData as Equipment,
      error: null,
    }
  } catch (err) {
    console.error('[createEquipment] Unexpected error:', err)
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'An unknown error occurred while creating the equipment.',
    }
  }
}

/**
 * Server Action to update equipment
 * 
 * @param params - The equipment update parameters
 * @returns An object containing success status, updated Equipment data, or an error message
 */
export async function updateEquipment(
  params: UpdateEquipmentParams
): Promise<{
  success: boolean
  data: Equipment | null
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
    const updateData: Partial<Equipment> = {
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

    const { data: equipmentData, error: updateError } = await supabaseAdmin
      .from('equipment')
      .update(updateData)
      .eq('equipment_id', params.equipment_id)
      .select()
      .single()

    if (updateError) {
      console.error('[updateEquipment] Error updating equipment:', updateError)
      return {
        success: false,
        data: null,
        error: 'Failed to update equipment: ' + updateError.message,
      }
    }

    if (!equipmentData) {
      return {
        success: false,
        data: null,
        error: 'Equipment not found after update.',
      }
    }

    return {
      success: true,
      data: equipmentData as Equipment,
      error: null,
    }
  } catch (err) {
    console.error('[updateEquipment] Unexpected error:', err)
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'An unknown error occurred while updating the equipment.',
    }
  }
}


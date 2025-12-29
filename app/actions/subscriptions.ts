'use server'

import { createClient } from '@supabase/supabase-js'

/**
 * Get Supabase credentials from environment variables
 */
const supabaseUrl = "https://ocfufnbhqxzwsrxxulup.supabase.co";
const supabaseServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZnVmbmJocXh6d3NyeHh1bHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzMzMTQ0NywiZXhwIjoyMDc4OTA3NDQ3fQ.B9JSyL6eTg99732hPbUFazai3tLwqGMf2j9zxUx7mfo";

/**
 * Interface representing a subscription from the database
 */
export interface Subscription {
  subscription_id: string
  name: string
  description: string | null
  tier_level: number
  duration_months: number
  price_usd: number
  is_active: boolean
  created_at: string
  updated_at: string
}

/**
 * Interface for creating a subscription
 */
export interface CreateSubscriptionParams {
  name: string
  description?: string | null
  tier_level: number
  duration_months: number
  price_usd: number
  is_active?: boolean
}

/**
 * Interface for updating a subscription
 */
export interface UpdateSubscriptionParams {
  subscription_id: string
  name?: string
  description?: string | null
  tier_level?: number
  duration_months?: number
  price_usd?: number
  is_active?: boolean
}

/**
 * Server Action to fetch all subscriptions from Supabase
 * 
 * @returns An object containing success status, an array of Subscription data, or an error message
 */
export async function getSubscriptions(): Promise<{
  success: boolean
  data: Subscription[] | null
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
      .from('subscriptions')
      .select('*')
      .order('tier_level', { ascending: true })

    if (error) {
      console.error('[getSubscriptions] Error fetching subscriptions:', error)
      return {
        success: false,
        data: null,
        error: 'Database query failed: ' + error.message,
      }
    }

    const subscriptions = (data || []) as Subscription[]

    return { success: true, data: subscriptions, error: null }
  } catch (err) {
    console.error('[getSubscriptions] Unexpected error:', err)
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'An unknown error occurred while fetching subscriptions.',
    }
  }
}

/**
 * Server Action to create a new subscription
 * 
 * @param params - The subscription data
 * @returns An object containing success status, created Subscription data, or an error message
 */
export async function createSubscription(
  params: CreateSubscriptionParams
): Promise<{
  success: boolean
  data: Subscription | null
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

    const { data: subscriptionData, error: insertError } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        name: params.name,
        description: params.description || null,
        tier_level: params.tier_level,
        duration_months: params.duration_months,
        price_usd: params.price_usd,
        is_active: params.is_active !== undefined ? params.is_active : true,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error('[createSubscription] Error creating subscription:', insertError)
      return {
        success: false,
        data: null,
        error: 'Failed to create subscription: ' + insertError.message,
      }
    }

    if (!subscriptionData) {
      return {
        success: false,
        data: null,
        error: 'Subscription not found after creation.',
      }
    }

    return {
      success: true,
      data: subscriptionData as Subscription,
      error: null,
    }
  } catch (err) {
    console.error('[createSubscription] Unexpected error:', err)
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'An unknown error occurred while creating the subscription.',
    }
  }
}

/**
 * Server Action to update a subscription
 * 
 * @param params - The subscription update parameters
 * @returns An object containing success status, updated Subscription data, or an error message
 */
export async function updateSubscription(
  params: UpdateSubscriptionParams
): Promise<{
  success: boolean
  data: Subscription | null
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
    const updateData: Partial<Subscription> = {
      updated_at: new Date().toISOString(),
    }

    if (params.name !== undefined) {
      updateData.name = params.name
    }
    if (params.description !== undefined) {
      updateData.description = params.description
    }
    if (params.tier_level !== undefined) {
      updateData.tier_level = params.tier_level
    }
    if (params.duration_months !== undefined) {
      updateData.duration_months = params.duration_months
    }
    if (params.price_usd !== undefined) {
      updateData.price_usd = params.price_usd
    }
    if (params.is_active !== undefined) {
      updateData.is_active = params.is_active
    }

    const { data: subscriptionData, error: updateError } = await supabaseAdmin
      .from('subscriptions')
      .update(updateData)
      .eq('subscription_id', params.subscription_id)
      .select()
      .single()

    if (updateError) {
      console.error('[updateSubscription] Error updating subscription:', updateError)
      return {
        success: false,
        data: null,
        error: 'Failed to update subscription: ' + updateError.message,
      }
    }

    if (!subscriptionData) {
      return {
        success: false,
        data: null,
        error: 'Subscription not found after update.',
      }
    }

    return {
      success: true,
      data: subscriptionData as Subscription,
      error: null,
    }
  } catch (err) {
    console.error('[updateSubscription] Unexpected error:', err)
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'An unknown error occurred while updating the subscription.',
    }
  }
}

/**
 * Server Action to delete a subscription
 * 
 * @param subscription_id - The subscription ID to delete
 * @returns An object containing success status and any errors
 */
export async function deleteSubscription(
  subscription_id: string
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
      .from('subscriptions')
      .delete()
      .eq('subscription_id', subscription_id)

    if (deleteError) {
      console.error('[deleteSubscription] Error deleting subscription:', deleteError)
      return {
        success: false,
        error: 'Failed to delete subscription: ' + deleteError.message,
      }
    }

    return {
      success: true,
      error: null,
    }
  } catch (err) {
    console.error('[deleteSubscription] Unexpected error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unknown error occurred while deleting the subscription.',
    }
  }
}


'use server'

import { createClient } from '@supabase/supabase-js'

/**
 * Get Supabase credentials from environment variables
 */
const supabaseUrl = "https://ocfufnbhqxzwsrxxulup.supabase.co";
const supabaseServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZnVmbmJocXh6d3NyeHh1bHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzMzMTQ0NywiZXhwIjoyMDc4OTA3NDQ3fQ.B9JSyL6eTg99732hPbUFazai3tLwqGMf2j9zxUx7mfo";

/**
 * Interface representing a class video relationship
 */
export interface ClassVideo {
  class_video_id: string
  class_id: string
  video_id: string
  description: string | null
  sort_order: number
  created_at: string
}

/**
 * Interface for creating a class video relationship
 */
export interface CreateClassVideoParams {
  class_id: string
  video_id: string
  description?: string | null
  sort_order?: number
}

/**
 * Interface for updating a class video relationship
 */
export interface UpdateClassVideoParams {
  class_video_id: string
  description?: string | null
  sort_order?: number
}

/**
 * Server Action to fetch all videos for a specific class
 * 
 * @param class_id - The class ID
 * @returns An object containing success status, an array of ClassVideo data with video details, or an error message
 */
export async function getClassVideos(class_id: string): Promise<{
  success: boolean
  data: Array<ClassVideo & { video?: { video_id: string; description: string | null; mux_playback_id: string | null; thumbnail_url: string | null; meta_title: string | null } }> | null
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

    // Fetch class videos with video details
    const { data, error } = await supabaseAdmin
      .from('class_videos')
      .select(`
        *,
        videos:video_id (
          video_id,
          description,
          mux_playback_id,
          thumbnail_url,
          meta_title
        )
      `)
      .eq('class_id', class_id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      console.error('[getClassVideos] Error fetching class videos:', error)
      return {
        success: false,
        data: null,
        error: 'Database query failed: ' + error.message,
      }
    }

    return { success: true, data: (data || []) as any, error: null }
  } catch (err) {
    console.error('[getClassVideos] Unexpected error:', err)
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'An unknown error occurred while fetching class videos.',
    }
  }
}

/**
 * Server Action to create a new class video relationship
 * 
 * @param params - The class video data
 * @returns An object containing success status, created ClassVideo data, or an error message
 */
export async function createClassVideo(
  params: CreateClassVideoParams
): Promise<{
  success: boolean
  data: ClassVideo | null
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

    // Get the max sort_order for this class to append at the end
    const { data: existingVideos } = await supabaseAdmin
      .from('class_videos')
      .select('sort_order')
      .eq('class_id', params.class_id)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single()

    const sortOrder = params.sort_order !== undefined 
      ? params.sort_order 
      : (existingVideos?.sort_order !== undefined ? existingVideos.sort_order + 1 : 0)

    const { data: classVideoData, error: insertError } = await supabaseAdmin
      .from('class_videos')
      .insert({
        class_id: params.class_id,
        video_id: params.video_id,
        description: params.description || null,
        sort_order: sortOrder,
      })
      .select()
      .single()

    if (insertError) {
      console.error('[createClassVideo] Error creating class video:', insertError)
      return {
        success: false,
        data: null,
        error: 'Failed to create class video: ' + insertError.message,
      }
    }

    if (!classVideoData) {
      return {
        success: false,
        data: null,
        error: 'Class video not found after creation.',
      }
    }

    return {
      success: true,
      data: classVideoData as ClassVideo,
      error: null,
    }
  } catch (err) {
    console.error('[createClassVideo] Unexpected error:', err)
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'An unknown error occurred while creating the class video.',
    }
  }
}

/**
 * Server Action to update a class video relationship
 * 
 * @param params - The class video update parameters
 * @returns An object containing success status, updated ClassVideo data, or an error message
 */
export async function updateClassVideo(
  params: UpdateClassVideoParams
): Promise<{
  success: boolean
  data: ClassVideo | null
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

    const updateData: Partial<ClassVideo> = {}

    if (params.description !== undefined) {
      updateData.description = params.description
    }
    if (params.sort_order !== undefined) {
      updateData.sort_order = params.sort_order
    }

    const { data: classVideoData, error: updateError } = await supabaseAdmin
      .from('class_videos')
      .update(updateData)
      .eq('class_video_id', params.class_video_id)
      .select()
      .single()

    if (updateError) {
      console.error('[updateClassVideo] Error updating class video:', updateError)
      return {
        success: false,
        data: null,
        error: 'Failed to update class video: ' + updateError.message,
      }
    }

    if (!classVideoData) {
      return {
        success: false,
        data: null,
        error: 'Class video not found after update.',
      }
    }

    return {
      success: true,
      data: classVideoData as ClassVideo,
      error: null,
    }
  } catch (err) {
    console.error('[updateClassVideo] Unexpected error:', err)
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'An unknown error occurred while updating the class video.',
    }
  }
}

/**
 * Server Action to delete a class video relationship
 * 
 * @param class_video_id - The class video ID to delete
 * @returns An object containing success status and any errors
 */
export async function deleteClassVideo(
  class_video_id: string
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
      .from('class_videos')
      .delete()
      .eq('class_video_id', class_video_id)

    if (deleteError) {
      console.error('[deleteClassVideo] Error deleting class video:', deleteError)
      return {
        success: false,
        error: 'Failed to delete class video: ' + deleteError.message,
      }
    }

    return {
      success: true,
      error: null,
    }
  } catch (err) {
    console.error('[deleteClassVideo] Unexpected error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unknown error occurred while deleting the class video.',
    }
  }
}

/**
 * Server Action to update sort order for multiple class videos
 * 
 * @param updates - Array of { class_video_id, sort_order } pairs
 * @returns An object containing success status and any errors
 */
export async function updateClassVideoOrder(
  updates: Array<{ class_video_id: string; sort_order: number }>
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

    // Update each class video's sort_order
    const updatePromises = updates.map((update) =>
      supabaseAdmin
        .from('class_videos')
        .update({
          sort_order: update.sort_order,
        })
        .eq('class_video_id', update.class_video_id)
    )

    const results = await Promise.all(updatePromises)

    // Check for any errors
    const errors = results.filter((result) => result.error)
    if (errors.length > 0) {
      console.error('[updateClassVideoOrder] Error updating order:', errors)
      return {
        success: false,
        error: 'Failed to update some class videos: ' + errors.map((e) => e.error?.message).join(', '),
      }
    }

    return {
      success: true,
      error: null,
    }
  } catch (err) {
    console.error('[updateClassVideoOrder] Unexpected error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unknown error occurred while updating class video order.',
    }
  }
}


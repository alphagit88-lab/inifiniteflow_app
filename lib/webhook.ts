import { createClient } from '@supabase/supabase-js'

/**
 * Supabase credentials (same as in app/actions/mux.ts)
 */
const supabaseUrl = "https://ocfufnbhqxzwsrxxulup.supabase.co";
const supabaseServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZnVmbmJocXh6d3NyeHh1bHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzMzMTQ0NywiZXhwIjoyMDc4OTA3NDQ3fQ.B9JSyL6eTg99732hPbUFazai3tLwqGMf2j9zxUx7mfo";

/**
 * Updates the videos table in Supabase with Mux asset and playback IDs
 * Uses Service Role Key to bypass RLS policies
 * 
 * @param muxUploadId - The Mux upload ID (stored when upload is created)
 * @param muxAssetId - The Mux asset ID (from webhook)
 * @param muxPlaybackId - The Mux playback ID (from webhook)
 * @returns Success status and error message if any
 */
export async function updateVideoWithMuxIds(
  muxUploadId: string,
  muxAssetId: string,
  muxPlaybackId: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return {
        success: false,
        error: 'Supabase credentials are not configured.',
      }
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Find the video by mux_upload_id and update with asset_id and playback_id
    const { data, error } = await supabaseAdmin
      .from('videos')
      .update({
        mux_asset_id: muxAssetId,
        mux_playback_id: muxPlaybackId,
        updated_at: new Date().toISOString(),
      })
      .eq('mux_upload_id', muxUploadId)
      .select()

    if (error) {
      console.error('[updateVideoWithMuxIds] Error updating video:', error)
      return {
        success: false,
        error: `Failed to update video: ${error.message}`,
      }
    }

    if (!data || data.length === 0) {
      console.warn(`[updateVideoWithMuxIds] No video found with mux_upload_id: ${muxUploadId}`)
      return {
        success: false,
        error: `No video found with upload ID: ${muxUploadId}`,
      }
    }

    console.log(`[updateVideoWithMuxIds] Successfully updated video with mux_upload_id: ${muxUploadId}`)
    return { success: true }
  } catch (err) {
    console.error('[updateVideoWithMuxIds] Unexpected error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unknown error occurred',
    }
  }
}


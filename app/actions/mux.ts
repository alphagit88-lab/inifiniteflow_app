'use server'

import Mux from '@mux/mux-node'
import { createClient } from '@supabase/supabase-js'

/**
 * Get Supabase credentials from environment variables (matching .env.local)
 */
const supabaseUrl = "https://ocfufnbhqxzwsrxxulup.supabase.co";
const supabaseServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZnVmbmJocXh6d3NyeHh1bHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzMzMTQ0NywiZXhwIjoyMDc4OTA3NDQ3fQ.B9JSyL6eTg99732hPbUFazai3tLwqGMf2j9zxUx7mfo";

/**
 * Get Mux client instance
 * Initialized lazily to handle missing environment variables gracefully
 */
function getMuxClient(): Mux {
  const tokenId = process.env.MUX_TOKEN_ID
  const tokenSecret = process.env.MUX_TOKEN_SECRET

  if (!tokenId || !tokenSecret) {
    throw new Error('Mux credentials are not configured (MUX_TOKEN_ID or MUX_TOKEN_SECRET missing).')
  }

  // 🚨 FIX: Mux SDK constructor (v8+) typically requires an object for credentials.
  // This prevents the "Cannot read properties of undefined" error on initialization.
  return new Mux({ tokenId, tokenSecret })
}

/**
 * Interface for the upload request parameters
 */
export interface GetMuxUploadUrlParams {
  description: string
  status: 'Draft' | 'Published'
  subscription_plan: 'free' | 'premium'
  meta_title?: string | null
  meta_description?: string | null
  thumbnail_url?: string | null
  equipments?: string[] | null
  instructions?: string | null
  min_calories?: number | null
  max_calories?: number | null
}

/**
 * Interface representing a video from the database
 */
export interface Video {
  video_id: string
  description: string | null
  status: 'Draft' | 'Published'
  subscription_plan: 'free' | 'premium'
  mux_upload_id: string | null
  mux_asset_id: string | null
  mux_playback_id: string | null
  created_at: string
  updated_at: string
  meta_title: string | null
  meta_description: string | null
  is_deleted: boolean | null
  deleted_time: string | null
  thumbnail_url: string | null
  equipments: string[] | null
  instructions: string | null
  min_calories: number | null
  max_calories: number | null
}

/**
 * Interface for updating video metadata
 */
export interface UpdateVideoParams {
  video_id: string
  description?: string
  status?: 'Draft' | 'Published'
  subscription_plan?: 'free' | 'premium'
  meta_title?: string | null
  meta_description?: string | null
  thumbnail_url?: string | null
  equipments?: string[] | null
  instructions?: string | null
  min_calories?: number | null
  max_calories?: number | null
}

/**
 * Server Action to create a Mux direct upload URL and save metadata to Supabase
 *
 * @param params - The video metadata (description, status, subscription_plan)
 * @returns An object containing success status, the upload URL, upload ID, and video ID, or an error message
 */
export async function getMuxUploadUrl(
  params: GetMuxUploadUrlParams
): Promise<{
  success: boolean
  uploadUrl?: string
  uploadId?: string
  videoId?: string
  error?: string
}> {
  try {
    // 1. Validate environment variables and get Mux client
    let mux: Mux
    if (!supabaseUrl || !supabaseServiceRoleKey) {
        return {
            success: false,
            error: 'Supabase credentials are not configured. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
        }
    }

    try {
      mux = getMuxClient()
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Mux client initialization failed.',
      }
    }

    // 2. Create a Mux direct upload
    // Use `mux.video.uploads.create` for direct uploads (not directUploads)
    // Set playback policy based on subscription plan: free = public, premium = signed
    const playbackPolicy: ('public' | 'signed')[] = params.subscription_plan === 'free' ? ['public'] : ['signed']
    
    const upload = await mux.video.uploads.create({
      cors_origin: '*', // Required: Allow uploads from any origin (or specify your domain)
      // Optional: Pass metadata that Mux will attach to the asset later (for webhooks)
      new_asset_settings: {
        playback_policy: playbackPolicy,
        passthrough: JSON.stringify({
          description: params.description,
          status: params.status,
          subscription_plan: params.subscription_plan,
        }),
      },
    })

    if (!upload || !upload.id || !upload.url) {
      return {
        success: false,
        error: 'Failed to create Mux upload. Invalid response from Mux API.',
      }
    }

    // 3. Create Supabase admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

    // 4. Insert video metadata into Supabase before returning the upload URL
    const { data: videoData, error: insertError } = await supabaseAdmin
      .from('videos')
      .insert({
        description: params.description,
        status: params.status,
        subscription_plan: params.subscription_plan,
        mux_upload_id: upload.id,
        meta_title: params.meta_title || null,
        meta_description: params.meta_description || null,
        thumbnail_url: params.thumbnail_url || null,
        equipments: params.equipments || null,
        instructions: params.instructions || null,
        min_calories: params.min_calories || null,
        max_calories: params.max_calories || null,
      })
      .select('video_id')
      .single()

    if (insertError) {
      console.error('[getMuxUploadUrl] Error inserting video metadata:', insertError)
      return {
        success: false,
        error: 'Failed to save video metadata: ' + insertError.message,
      }
    }

    if (!videoData || !videoData.video_id) {
      return {
        success: false,
        error: 'Failed to retrieve video ID after insertion.',
      }
    }

    return {
      success: true,
      uploadUrl: upload.url,
      uploadId: upload.id,
      videoId: videoData.video_id,
    }
  } catch (err) {
    console.error('[getMuxUploadUrl] Unexpected error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unknown error occurred while creating the upload URL.',
    }
  }
}

/**
 * Server Action to fetch all videos from Supabase
 * 
 * @returns An object containing success status, an array of Video data, or an error message
 */
export async function getVideos(): Promise<{
  success: boolean
  data: Video[] | null
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
      .from('videos')
      .select('*')
      .or('is_deleted.eq.false,is_deleted.is.null')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[getVideos] Error fetching videos:', error)
      return {
        success: false,
        data: null,
        error: 'Database query failed: ' + error.message,
      }
    }

    const videos = (data || []) as Video[]

    return { success: true, data: videos, error: null }
  } catch (err) {
    console.error('[getVideos] Unexpected error:', err)
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'An unknown error occurred while fetching videos.',
    }
  }
}

/**
 * Server Action to update video metadata in Supabase
 * 
 * @param params - The video update parameters (video_id and fields to update)
 * @returns An object containing success status, updated Video data, or an error message
 */
export async function updateVideo(
  params: UpdateVideoParams
): Promise<{
  success: boolean
  data: Video | null
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
    const updateData: Partial<Video> = {
      updated_at: new Date().toISOString(),
    }

    if (params.description !== undefined) {
      updateData.description = params.description
    }
    if (params.status !== undefined) {
      updateData.status = params.status
    }
    if (params.subscription_plan !== undefined) {
      updateData.subscription_plan = params.subscription_plan
    }
    if (params.meta_title !== undefined) {
      updateData.meta_title = params.meta_title
    }
    if (params.meta_description !== undefined) {
      updateData.meta_description = params.meta_description
    }
    if (params.thumbnail_url !== undefined) {
      updateData.thumbnail_url = params.thumbnail_url
    }
    if (params.equipments !== undefined) {
      updateData.equipments = params.equipments
    }
    if (params.instructions !== undefined) {
      updateData.instructions = params.instructions
    }
    if (params.min_calories !== undefined) {
      updateData.min_calories = params.min_calories
    }
    if (params.max_calories !== undefined) {
      updateData.max_calories = params.max_calories
    }

    const { data: videoData, error: updateError } = await supabaseAdmin
      .from('videos')
      .update(updateData)
      .eq('video_id', params.video_id)
      .select()
      .single()

    if (updateError) {
      console.error('[updateVideo] Error updating video:', updateError)
      return {
        success: false,
        data: null,
        error: 'Failed to update video: ' + updateError.message,
      }
    }

    if (!videoData) {
      return {
        success: false,
        data: null,
        error: 'Video not found after update.',
      }
    }

    return {
      success: true,
      data: videoData as Video,
      error: null,
    }
  } catch (err) {
    console.error('[updateVideo] Unexpected error:', err)
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'An unknown error occurred while updating the video.',
    }
  }
}

/**
 * Server Action to check and update playback IDs for a specific video by asset ID
 * Polls Mux API to check if the asset is ready and updates the database
 * 
 * @param muxAssetId - The Mux asset ID to check
 * @param videoId - The video ID in the database
 * @returns An object containing success status, whether asset is ready, and any errors
 */
export async function checkAndUpdateVideoPlaybackIdByAsset(
  muxAssetId: string,
  videoId: string
): Promise<{
  success: boolean
  isReady: boolean
  error?: string
}> {
  try {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return {
        success: false,
        isReady: false,
        error: 'Supabase credentials are not configured.',
      }
    }

    let mux: Mux
    try {
      mux = getMuxClient()
    } catch (err) {
      return {
        success: false,
        isReady: false,
        error: err instanceof Error ? err.message : 'Mux client initialization failed.',
      }
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Get the asset details directly
    let asset
    try {
      asset = await mux.video.assets.retrieve(muxAssetId)
    } catch (err) {
      console.error(`[checkAndUpdateVideoPlaybackIdByAsset] Error retrieving asset ${muxAssetId}:`, err)
      return {
        success: false,
        isReady: false,
        error: 'Failed to retrieve asset from Mux',
      }
    }

    // Check if asset is ready (status should be 'ready')
    if (asset.status !== 'ready') {
      // Asset exists but not ready yet
      return {
        success: true,
        isReady: false,
      }
    }

    // Asset is ready, get playback IDs
    const playbackIds = asset.playback_ids || []
    const playbackId = playbackIds.find((p: any) => p.policy === 'public')?.id || playbackIds[0]?.id || null

    // Update the database
    const { error: updateError } = await supabaseAdmin
      .from('videos')
      .update({
        mux_asset_id: muxAssetId,
        mux_playback_id: playbackId,
        updated_at: new Date().toISOString(),
      })
      .eq('video_id', videoId)

    if (updateError) {
      console.error(`[checkAndUpdateVideoPlaybackIdByAsset] Error updating video:`, updateError)
      return {
        success: false,
        isReady: false,
        error: 'Failed to update database: ' + updateError.message,
      }
    }

    return {
      success: true,
      isReady: true,
    }
  } catch (err) {
    console.error('[checkAndUpdateVideoPlaybackIdByAsset] Unexpected error:', err)
    return {
      success: false,
      isReady: false,
      error: err instanceof Error ? err.message : 'An unknown error occurred',
    }
  }
}

/**
 * Server Action to check and update playback IDs for a specific video by upload ID
 * Polls Mux API to check if the asset is ready and updates the database
 * 
 * @param muxUploadId - The Mux upload ID to check
 * @returns An object containing success status, whether asset is ready, and any errors
 */
export async function checkAndUpdateVideoPlaybackId(
  muxUploadId: string
): Promise<{
  success: boolean
  isReady: boolean
  error?: string
}> {
  try {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return {
        success: false,
        isReady: false,
        error: 'Supabase credentials are not configured.',
      }
    }

    let mux: Mux
    try {
      mux = getMuxClient()
    } catch (err) {
      return {
        success: false,
        isReady: false,
        error: err instanceof Error ? err.message : 'Mux client initialization failed.',
      }
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Get the upload info from Mux
    let upload
    try {
      upload = await mux.video.uploads.retrieve(muxUploadId)
    } catch (err) {
      console.error(`[checkAndUpdateVideoPlaybackId] Error retrieving upload ${muxUploadId}:`, err)
      return {
        success: false,
        isReady: false,
        error: 'Failed to retrieve upload from Mux',
      }
    }

    // Check if upload has an asset_id (means processing has started/completed)
    if (!upload.asset_id) {
      // Asset not created yet, still processing
      return {
        success: true,
        isReady: false,
      }
    }

    // Get the asset details
    let asset
    try {
      asset = await mux.video.assets.retrieve(upload.asset_id)
    } catch (err) {
      console.error(`[checkAndUpdateVideoPlaybackId] Error retrieving asset ${upload.asset_id}:`, err)
      return {
        success: false,
        isReady: false,
        error: 'Failed to retrieve asset from Mux',
      }
    }

    // Check if asset is ready (status should be 'ready')
    if (asset.status !== 'ready') {
      // Asset exists but not ready yet
      return {
        success: true,
        isReady: false,
      }
    }

    // Asset is ready, get playback IDs
    const playbackIds = asset.playback_ids || []
    const playbackId = playbackIds.find((p: any) => p.policy === 'public')?.id || playbackIds[0]?.id || null

    // Update the database
    const { error: updateError } = await supabaseAdmin
      .from('videos')
      .update({
        mux_asset_id: upload.asset_id,
        mux_playback_id: playbackId,
        updated_at: new Date().toISOString(),
      })
      .eq('mux_upload_id', muxUploadId)

    if (updateError) {
      console.error(`[checkAndUpdateVideoPlaybackId] Error updating video:`, updateError)
      return {
        success: false,
        isReady: false,
        error: 'Failed to update database: ' + updateError.message,
      }
    }

    return {
      success: true,
      isReady: true,
    }
  } catch (err) {
    console.error('[checkAndUpdateVideoPlaybackId] Unexpected error:', err)
    return {
      success: false,
      isReady: false,
      error: err instanceof Error ? err.message : 'An unknown error occurred',
    }
  }
}

/**
 * Server Action to sync playback IDs from Mux for videos that are missing them
 * This is useful when webhooks haven't been set up or videos were uploaded before webhook configuration
 * 
 * @returns An object containing success status, number of videos synced, and any errors
 */
export async function syncVideoPlaybackIds(): Promise<{
  success: boolean
  synced: number
  error?: string
}> {
  try {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return {
        success: false,
        synced: 0,
        error: 'Supabase credentials are not configured.',
      }
    }

    let mux: Mux
    try {
      mux = getMuxClient()
    } catch (err) {
      return {
        success: false,
        synced: 0,
        error: err instanceof Error ? err.message : 'Mux client initialization failed.',
      }
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Get all videos that have mux_upload_id but no mux_playback_id
    const { data: videos, error: fetchError } = await supabaseAdmin
      .from('videos')
      .select('video_id, mux_upload_id, mux_asset_id')
      .not('mux_upload_id', 'is', null)
      .or('mux_playback_id.is.null,mux_asset_id.is.null')

    if (fetchError) {
      console.error('[syncVideoPlaybackIds] Error fetching videos:', fetchError)
      return {
        success: false,
        synced: 0,
        error: 'Failed to fetch videos: ' + fetchError.message,
      }
    }

    if (!videos || videos.length === 0) {
      return {
        success: true,
        synced: 0,
      }
    }

    let syncedCount = 0

    // For each video, try to get the asset info from Mux
    for (const video of videos) {
      try {
        let assetId = video.mux_asset_id

        // If we don't have asset_id, try to get it from the upload
        if (!assetId && video.mux_upload_id) {
          try {
            const upload = await mux.video.uploads.retrieve(video.mux_upload_id)
            if (upload?.asset_id) {
              assetId = upload.asset_id
            }
          } catch (err) {
            console.warn(`[syncVideoPlaybackIds] Could not get asset_id from upload ${video.mux_upload_id}:`, err)
            continue
          }
        }

        if (!assetId) {
          console.warn(`[syncVideoPlaybackIds] No asset_id for video ${video.video_id}`)
          continue
        }

        // Get the asset details from Mux
        const asset = await mux.video.assets.retrieve(assetId)

        if (!asset) {
          console.warn(`[syncVideoPlaybackIds] Asset ${assetId} not found`)
          continue
        }

        // Get playback IDs
        const playbackIds = asset.playback_ids || []
        const playbackId = playbackIds.find((p: any) => p.policy === 'public')?.id || playbackIds[0]?.id || null

        // Update the database
        const { error: updateError } = await supabaseAdmin
          .from('videos')
          .update({
            mux_asset_id: assetId,
            mux_playback_id: playbackId,
            updated_at: new Date().toISOString(),
          })
          .eq('video_id', video.video_id)

        if (updateError) {
          console.error(`[syncVideoPlaybackIds] Error updating video ${video.video_id}:`, updateError)
        } else {
          syncedCount++
          console.log(`[syncVideoPlaybackIds] Successfully synced video ${video.video_id}`)
        }
      } catch (err) {
        console.error(`[syncVideoPlaybackIds] Error processing video ${video.video_id}:`, err)
      }
    }

    return {
      success: true,
      synced: syncedCount,
    }
  } catch (err) {
    console.error('[syncVideoPlaybackIds] Unexpected error:', err)
    return {
      success: false,
      synced: 0,
      error: err instanceof Error ? err.message : 'An unknown error occurred while syncing playback IDs.',
    }
  }
}

/**
 * Server Action to import a video from a public URL to Mux
 * 
 * @param params - The video metadata and URL
 * @returns An object containing success status, upload ID, video ID, or an error message
 */
export async function importVideoFromUrl(
  params: GetMuxUploadUrlParams & { video_url: string }
): Promise<{
  success: boolean
  uploadId?: string
  videoId?: string
  error?: string
}> {
  try {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return {
        success: false,
        error: 'Supabase credentials are not configured.',
      }
    }

    // Validate URL
    try {
      new URL(params.video_url)
    } catch {
      return {
        success: false,
        error: 'Invalid video URL provided.',
      }
    }

    let mux: Mux
    try {
      mux = getMuxClient()
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Mux client initialization failed.',
      }
    }

    // Set playback policy based on subscription plan
    const playbackPolicy: ('public' | 'signed')[] = params.subscription_plan === 'free' ? ['public'] : ['signed']

    // Create asset directly from URL
    let asset
    try {
      asset = await mux.video.assets.create({
        inputs: [{ url: params.video_url }],
        playback_policy: playbackPolicy,
        passthrough: JSON.stringify({
          description: params.description,
          status: params.status,
          subscription_plan: params.subscription_plan,
        }),
      })
    } catch (err: any) {
      console.error('[importVideoFromUrl] Error creating asset from URL:', err)
      
      // Handle Mux API errors
      if (err?.response?.data?.error) {
        const muxError = err.response.data.error
        if (muxError.type === 'download_failed' || muxError.message?.includes('download')) {
          return {
            success: false,
            error: `Failed to download video from URL. The video file must be publicly accessible without authentication. Error: ${muxError.message || 'The URL could not be accessed by Mux.'}`,
          }
        }
        return {
          success: false,
          error: `Mux API error: ${muxError.message || muxError.type || 'Unknown error'}`,
        }
      }
      
      return {
        success: false,
        error: err?.message || 'Failed to create Mux asset from URL. Please ensure the URL is publicly accessible.',
      }
    }

    if (!asset || !asset.id) {
      return {
        success: false,
        error: 'Failed to create Mux asset from URL. Invalid response from Mux API.',
      }
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Insert video metadata into Supabase
    const { data: videoData, error: insertError } = await supabaseAdmin
      .from('videos')
      .insert({
        description: params.description,
        status: params.status,
        subscription_plan: params.subscription_plan,
        mux_asset_id: asset.id,
        mux_playback_id: asset.playback_ids?.[0]?.id || null,
        meta_title: params.meta_title || null,
        meta_description: params.meta_description || null,
        thumbnail_url: params.thumbnail_url || null,
        equipments: params.equipments || null,
        instructions: params.instructions || null,
        min_calories: params.min_calories || null,
        max_calories: params.max_calories || null,
      })
      .select('video_id')
      .single()

    if (insertError) {
      console.error('[importVideoFromUrl] Error inserting video metadata:', insertError)
      return {
        success: false,
        error: 'Failed to save video metadata: ' + insertError.message,
      }
    }

    if (!videoData || !videoData.video_id) {
      return {
        success: false,
        error: 'Failed to retrieve video ID after insertion.',
      }
    }

    return {
      success: true,
      uploadId: asset.id, // Using asset ID as upload ID for consistency
      videoId: videoData.video_id,
    }
  } catch (err) {
    console.error('[importVideoFromUrl] Unexpected error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unknown error occurred while importing the video from URL.',
    }
  }
}

/**
 * Server Action to upload a thumbnail image to Supabase Storage
 * 
 * @param file - The image file to upload
 * @param videoId - The video ID to associate the thumbnail with
 * @returns An object containing success status, the public URL of the uploaded thumbnail, or an error message
 */
export async function uploadThumbnail(
  file: File,
  videoId: string
): Promise<{
  success: boolean
  url?: string
  error?: string
}> {
  try {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return {
        success: false,
        error: 'Supabase credentials are not configured.',
      }
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'File must be an image.',
      }
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'Image size must be less than 5MB.',
      }
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Check if bucket exists, create if it doesn't
    const bucketName = 'videos'
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()
    
    if (listError) {
      console.error('[uploadThumbnail] Error listing buckets:', listError)
    } else {
      const bucketExists = buckets?.some(bucket => bucket.name === bucketName)
      if (!bucketExists) {
        // Try to create the bucket
        const { error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
          public: true,
          allowedMimeTypes: ['image/*'],
          fileSizeLimit: 5242880, // 5MB
        })
        
        if (createError) {
          console.error('[uploadThumbnail] Error creating bucket:', createError)
          return {
            success: false,
            error: `Storage bucket '${bucketName}' does not exist and could not be created. Please create it manually in Supabase Dashboard: Storage > New bucket. Error: ${createError.message}`,
          }
        }
      }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${videoId}-${Date.now()}.${fileExt}`
    const filePath = `thumbnails/${fileName}`

    // Convert File to ArrayBuffer for Supabase upload
    const arrayBuffer = await file.arrayBuffer()

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('[uploadThumbnail] Error uploading thumbnail:', uploadError)
      
      // Provide helpful error message if bucket doesn't exist
      if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('not found')) {
        return {
          success: false,
          error: `Storage bucket '${bucketName}' not found. Please create it in Supabase Dashboard: Storage > New bucket. Make it public and allow image/* MIME types.`,
        }
      }
      
      return {
        success: false,
        error: 'Failed to upload thumbnail: ' + uploadError.message,
      }
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(filePath)

    if (!urlData?.publicUrl) {
      return {
        success: false,
        error: 'Failed to get public URL for thumbnail.',
      }
    }

    return {
      success: true,
      url: urlData.publicUrl,
    }
  } catch (err) {
    console.error('[uploadThumbnail] Unexpected error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unknown error occurred while uploading the thumbnail.',
    }
  }
}

/**
 * Server Action to delete a video (soft delete)
 * Sets is_deleted = true and deleted_time = now()
 * 
 * @param video_id - The video ID to delete
 * @returns An object containing success status and any errors
 */
export async function deleteVideo(
  video_id: string
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

    const { error: updateError } = await supabaseAdmin
      .from('videos')
      .update({
        is_deleted: true,
        deleted_time: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('video_id', video_id)

    if (updateError) {
      console.error('[deleteVideo] Error deleting video:', updateError)
      return {
        success: false,
        error: 'Failed to delete video: ' + updateError.message,
      }
    }

    return {
      success: true,
      error: null,
    }
  } catch (err) {
    console.error('[deleteVideo] Unexpected error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unknown error occurred while deleting the video.',
    }
  }
}
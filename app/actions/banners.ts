'use server'

import { createClient } from '@supabase/supabase-js'

/**
 * Supabase credentials
 */
const supabaseUrl = 'https://ocfufnbhqxzwsrxxulup.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZnVmbmJocXh6d3NyeHh1bHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzMzMTQ0NywiZXhwIjoyMDc4OTA3NDQ3fQ.B9JSyL6eTg99732hPbUFazai3tLwqGMf2j9zxUx7mfo'

/**
 * Server Action to upload a banner image to Supabase Storage
 * 
 * @param file - The image file to upload (JPEG, PNG, or WebP)
 * @param classId - The class ID to associate the banner with
 * @returns An object containing success status, the public URL of the uploaded banner, or an error message
 */
export async function uploadBanner(
  file: File,
  classId: string
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

    // Validate file type (JPEG, PNG, WebP)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const allowedExtensions = ['jpeg', 'jpg', 'png', 'webp']
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    
    if (!file.type || !allowedTypes.includes(file.type)) {
      if (!fileExt || !allowedExtensions.includes(fileExt)) {
        return {
          success: false,
          error: 'File must be a JPEG, PNG, or WebP image.',
        }
      }
    }

    // Validate file size (max 10MB for banners)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'Image size must be less than 10MB.',
      }
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Check if bucket exists, create if it doesn't
    const bucketName = 'banners'
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()
    
    if (listError) {
      console.error('[uploadBanner] Error listing buckets:', listError)
    } else {
      const bucketExists = buckets?.some(bucket => bucket.name === bucketName)
      if (!bucketExists) {
        // Try to create the bucket
        const { error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
          fileSizeLimit: 10485760, // 10MB
        })
        
        if (createError) {
          console.error('[uploadBanner] Error creating bucket:', createError)
          return {
            success: false,
            error: `Storage bucket '${bucketName}' does not exist and could not be created. Please create it manually in Supabase Dashboard: Storage > New bucket. Error: ${createError.message}`,
          }
        }
      }
    }

    // Generate unique filename
    const fileName = `${classId}-${Date.now()}.${fileExt}`
    const filePath = `banners/${fileName}`

    // Convert File to ArrayBuffer for Supabase upload
    const arrayBuffer = await file.arrayBuffer()

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(filePath, arrayBuffer, {
        contentType: file.type || `image/${fileExt}`,
        upsert: false,
      })

    if (uploadError) {
      console.error('[uploadBanner] Error uploading banner:', uploadError)
      
      // Provide helpful error message if bucket doesn't exist
      if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('not found')) {
        return {
          success: false,
          error: `Storage bucket '${bucketName}' not found. Please create it in Supabase Dashboard: Storage > New bucket. Make it public and allow image/* MIME types.`,
        }
      }
      
      return {
        success: false,
        error: 'Failed to upload banner: ' + uploadError.message,
      }
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(filePath)

    if (!urlData?.publicUrl) {
      return {
        success: false,
        error: 'Failed to get public URL for banner.',
      }
    }

    return {
      success: true,
      url: urlData.publicUrl,
    }
  } catch (err) {
    console.error('[uploadBanner] Unexpected error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unknown error occurred while uploading the banner.',
    }
  }
}


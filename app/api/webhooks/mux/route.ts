import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { updateVideoWithMuxIds } from '@/lib/webhook'

/**
 * Mux Webhook Handler
 * 
 * This endpoint receives webhooks from Mux when video processing is complete.
 * It verifies the webhook signature and updates the Supabase database with
 * the Mux asset ID and playback ID.
 * 
 * Required Environment Variables:
 * - MUX_WEBHOOK_SECRET: The webhook signing secret from Mux dashboard
 */

/**
 * Verifies the Mux webhook signature
 * 
 * @param payload - The raw request body as a string
 * @param signature - The signature from the Mux-Signature header
 * @param secret - The MUX_WEBHOOK_SECRET
 * @returns true if signature is valid, false otherwise
 */
function verifyMuxSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    // Mux uses HMAC-SHA256 with the secret
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(payload)
    const expectedSignature = hmac.digest('hex')

    // Mux sends signature in format: "t=<timestamp>,v1=<signature>"
    // We need to extract the v1 signature
    const signatureParts = signature.split(',')
    const v1Part = signatureParts.find((part) => part.startsWith('v1='))
    
    if (!v1Part) {
      console.error('[verifyMuxSignature] No v1 signature found in header')
      return false
    }

    const receivedSignature = v1Part.split('=')[1]
    
    // Use constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(receivedSignature)
    )
  } catch (error) {
    console.error('[verifyMuxSignature] Error verifying signature:', error)
    return false
  }
}

/**
 * POST handler for Mux webhooks
 */
export async function POST(request: NextRequest) {
  try {
    // Get the webhook secret from environment variables
    const webhookSecret = process.env.MUX_WEBHOOK_SECRET

    if (!webhookSecret) {
      console.error('[Mux Webhook] MUX_WEBHOOK_SECRET is not configured')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    // Get the signature from headers
    const signature = request.headers.get('mux-signature')

    if (!signature) {
      console.error('[Mux Webhook] Missing mux-signature header')
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      )
    }

    // Read the raw body for signature verification
    const body = await request.text()

    // Verify the webhook signature
    if (!verifyMuxSignature(body, signature, webhookSecret)) {
      console.error('[Mux Webhook] Invalid signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Parse the webhook payload
    let webhookData: any
    try {
      webhookData = JSON.parse(body)
    } catch (error) {
      console.error('[Mux Webhook] Invalid JSON payload:', error)
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      )
    }

    console.log('[Mux Webhook] Received webhook:', webhookData.type)

    // Handle different webhook event types
    const eventType = webhookData.type
    const eventData = webhookData.data

    // We're interested in the 'video.asset.ready' event
    // This is fired when Mux finishes processing the video
    if (eventType === 'video.asset.ready') {
      const assetId = eventData?.id
      const uploadId = eventData?.upload_id
      const playbackIds = eventData?.playback_ids || []

      if (!assetId || !uploadId) {
        console.error('[Mux Webhook] Missing required fields in asset.ready event:', {
          assetId,
          uploadId,
        })
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        )
      }

      // Get the first public playback ID (or the first one if no public)
      const playbackId = playbackIds.find((p: any) => p.policy === 'public')?.id || playbackIds[0]?.id || null

      console.log('[Mux Webhook] Updating video with:', {
        uploadId,
        assetId,
        playbackId,
      })

      // Update the database
      const result = await updateVideoWithMuxIds(uploadId, assetId, playbackId)

      if (!result.success) {
        console.error('[Mux Webhook] Failed to update video:', result.error)
        return NextResponse.json(
          { error: result.error || 'Failed to update video' },
          { status: 500 }
        )
      }

      console.log('[Mux Webhook] Successfully updated video')
      return NextResponse.json({ success: true })
    }

    // For other event types, just acknowledge receipt
    console.log(`[Mux Webhook] Received unhandled event type: ${eventType}`)
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Mux Webhook] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  )
}


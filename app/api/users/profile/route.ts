import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ocfufnbhqxzwsrxxulup.supabase.co'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZnVmbmJocXh6d3NyeHh1bHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzMzMTQ0NywiZXhwIjoyMDc4OTA3NDQ3fQ.B9JSyL6eTg99732hPbUFazai3tLwqGMf2j9zxUx7mfo'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

// GET /api/users/profile - Get user profile
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || searchParams.get('uid')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get user data from profiles table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (userError) {
      console.error('Profile fetch error:', userError)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, user: userData },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// PUT /api/users/profile - Update user profile
export async function PUT(request: Request) {
  try {
    const payload = await request.json()
    const { userId, uid, ...updates } = payload
    const userIdValue = userId || uid

    if (!userIdValue) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Only allow updating specific fields
    const allowedFields = [
      'email',
      'first_name',
      'last_name',
      'nickname',
      'profile_picture',
      'date_of_birth',
      'gender',
      'height',
      'height_unit',
      'weight',
      'weight_unit',
      'activity_level',
      'dietary_preference',
      'allergies',
      'onboarding_skip_step',
      'onboarding_completed_step'
    ]

    // Fields that are PostgreSQL arrays
    const arrayFields = ['allergies', 'onboarding_skip_step', 'onboarding_completed_step']

    const updateData: Record<string, any> = {}
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        let value = updates[key]
        
        // Handle array fields - ensure they are proper arrays
        if (arrayFields.includes(key)) {
          if (typeof value === 'string') {
            // If it's a JSON string, parse it
            try {
              value = JSON.parse(value)
            } catch {
              // If parsing fails, wrap single value in array
              value = value ? [value] : []
            }
          }
          // Ensure it's an array
          if (!Array.isArray(value)) {
            value = value ? [value] : []
          }
        }
        
        updateData[key] = value
      }
    })

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString()

    // Update profile record
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('user_id', userIdValue)
      .select()
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, user: updatedUser },
      { status: 200 }
    )
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

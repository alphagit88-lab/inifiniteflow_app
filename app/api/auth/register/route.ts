import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ocfufnbhqxzwsrxxulup.supabase.co'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZnVmbmJocXh6d3NyeHh1bHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzMzMTQ0NywiZXhwIjoyMDc4OTA3NDQ3fQ.B9JSyL6eTg99732hPbUFazai3tLwqGMf2j9zxUx7mfo'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

interface RegisterRequest {
  email: string
  password: string
  display_name: string
  phone?: string
  provider?: string
  provider_type?: string
}

export async function POST(request: Request) {
  try {
    const payload: RegisterRequest = await request.json()

    // Validation
    if (!payload.email || !payload.password || !payload.display_name) {
      return NextResponse.json(
        { error: 'Email, password, and display name are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(payload.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password length
    if (payload.password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Check if email already exists in profiles table
    const { data: existingProfiles, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('email', payload.email.trim().toLowerCase())
      .limit(1)

    if (checkError) {
      console.error('Error checking email:', checkError)
      return NextResponse.json(
        { error: 'Error checking email availability' },
        { status: 500 }
      )
    }

    if (existingProfiles && existingProfiles.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Create auth user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      email_confirm: true, // Auto-confirm for now
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message || 'Failed to create user account' },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Create user profile record in profiles table
    const profileData = {
      user_id: authData.user.id,
      email: payload.email.trim().toLowerCase(),
      first_name: payload.display_name.trim().split(' ')[0] || 'User',
      last_name: payload.display_name.trim().split(' ').slice(1).join(' ') || '',
      nickname: payload.display_name.trim(),
      user_type: 'S', // S for standard user
      profile_picture: null,
      date_of_birth: '2000-01-01', // Default date, user should update in onboarding
      gender: 'Other',
      subscription_plan: 1,
      subscription_status: 'inactive', // lowercase to match CHECK constraint
      subscription_start_date: null,
      subscription_end_date: null,
      height: 170,
      height_unit: 'cm',
      weight: 70,
      weight_unit: 'kg',
      activity_level: 'Moderate',
      dietary_preference: 'None',
      allergies: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: userRecord, error: userError } = await supabaseAdmin
      .from('profiles')
      .insert(profileData)
      .select('user_id, nickname, email, first_name, last_name, user_type, subscription_status, created_at')
      .single()

    if (userError) {
      // Rollback: delete auth user if user record creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: userError.message || 'Failed to create user record' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        user: userRecord,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    )
  }
}


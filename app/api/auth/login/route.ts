import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ocfufnbhqxzwsrxxulup.supabase.co'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZnVmbmJocXh6d3NyeHh1bHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzMzMTQ0NywiZXhwIjoyMDc4OTA3NDQ3fQ.B9JSyL6eTg99732hPbUFazai3tLwqGMf2j9zxUx7mfo'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

interface LoginRequest {
  email: string
  password: string
}

export async function POST(request: Request) {
  try {
    const payload: LoginRequest = await request.json()

    // Validation
    if (!payload.email || !payload.password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Authenticate user with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message || 'Invalid email or password' },
        { status: 401 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Authentication failed: User data missing' },
        { status: 401 }
      )
    }

    // Try to get/update profile in profiles table first
    let userData = null
    
    // Try profiles table
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single()

    if (!profileError && profileData) {
      // Update last login
      await supabaseAdmin
        .from('profiles')
        .update({ updated_at: new Date().toISOString() })
        .eq('user_id', authData.user.id)
      
      userData = {
        user_id: profileData.user_id,
        email: profileData.email || authData.user.email,
        nickname: profileData.nickname,
        user_type: profileData.user_type,
        subscription_status: profileData.subscription_status,
        created_at: profileData.created_at,
      }
    } else {
      // Try users table as fallback
      const { data: usersData, error: usersError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('uid', authData.user.id)
        .single()

      if (!usersError && usersData) {
        userData = usersData
      } else {
        // Return basic info if no profile found
        userData = {
          user_id: authData.user.id,
          email: authData.user.email,
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        user: userData,
        session: authData.session,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    )
  }
}


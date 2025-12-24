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

    // Update last_sign_in_at in users table
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({ last_sign_in_at: new Date().toISOString() })
      .eq('uid', authData.user.id)
      .select('uid, display_name, email, phone, provider, provider_type, created_at, last_sign_in_at')
      .single()

    if (updateError) {
      // Even if update fails, authentication was successful, so we still return success
      // but log the error
      console.error('Error updating last_sign_in_at:', updateError.message)
      
      // Try to get user data without updating
      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('uid, display_name, email, phone, provider, provider_type, created_at, last_sign_in_at')
        .eq('uid', authData.user.id)
        .single()

      return NextResponse.json(
        {
          success: true,
          message: 'Login successful',
          user: userData || {
            uid: authData.user.id,
            email: authData.user.email,
          },
          session: authData.session,
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        user: updatedUser,
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


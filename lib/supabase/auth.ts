import { supabase } from './supabaseClient'

export interface User {
  uid: string
  display_name: string
  email: string
  phone?: string | null
  provider: string
  provider_type: string
  created_at: string
  last_sign_in_at?: string | null
  // Extended profile fields
  first_name?: string | null
  last_name?: string | null
  nickname?: string | null
  date_of_birth?: string | null
  gender?: string | null
  height?: number | null
  height_unit?: string | null
  weight?: number | null
  weight_unit?: string | null
  activity_level?: string | null
  dietary_preference?: string | null
  allergies?: string | null
}

export interface AuthResponse {
  success: boolean
  user?: User
  session?: any
  error?: string
}

// Get current user session and data
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Error getting session:', error)
      return null
    }
    
    if (!session) {
      return null
    }
    
    // Try fetching from users table first
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('uid', session.user.id)
      .single()
    
    if (!userError && userData) {
      return userData as User
    }

    // Fallback to profiles table if users table doesn't have data
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (profileError) {
      console.error('Error fetching user data:', profileError)
      // Return basic user info from session if no profile found
      return {
        uid: session.user.id,
        display_name: session.user.email?.split('@')[0] || 'User',
        email: session.user.email || '',
        provider: 'email',
        provider_type: 'email',
        created_at: session.user.created_at || new Date().toISOString(),
      }
    }
    
    // Map profile data to User interface
    return {
      uid: profileData.user_id,
      display_name: profileData.nickname || profileData.email?.split('@')[0] || 'User',
      email: profileData.email || session.user.email || '',
      provider: 'email',
      provider_type: 'email',
      created_at: profileData.created_at || new Date().toISOString(),
      nickname: profileData.nickname,
    } as User
  } catch (error) {
    console.error('Error in getCurrentUser:', error)
    return null
  }
}

// Sign in with email and password
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim(),
        password,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Login failed',
      }
    }

    // Store session in Supabase client
    if (data.session) {
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      })
    }

    return {
      success: true,
      user: data.user,
      session: data.session,
    }
  } catch (error) {
    console.error('Sign in error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

// Sign up with email and password
export async function signUp(
  email: string,
  password: string,
  displayName: string,
  phone?: string
): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim(),
        password,
        display_name: displayName.trim(),
        phone: phone?.trim() || null,
        provider: 'email',
        provider_type: 'local',
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Sign up failed',
      }
    }

    return {
      success: true,
      user: data.user,
    }
  } catch (error) {
    console.error('Sign up error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

// Sign out
export async function signOut(): Promise<boolean> {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Sign out error:', error)
      return false
    }
    return true
  } catch (error) {
    console.error('Sign out error:', error)
    return false
  }
}

// Check if email is available
export async function checkEmailAvailability(email: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`)
    const data = await response.json()
    return data.is_available
  } catch (error) {
    console.error('Error checking email:', error)
    return false
  }
}

// Update user profile
export async function updateUserProfile(uid: string, updates: Partial<User>): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/users/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid,
        ...updates,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to update profile',
      }
    }

    return {
      success: true,
      user: data.user,
    }
  } catch (error) {
    console.error('Update profile error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

// Get user profile by ID
export async function getUserProfile(uid: string): Promise<User | null> {
  try {
    const response = await fetch(`/api/users/profile?uid=${encodeURIComponent(uid)}`)
    const data = await response.json()
    
    if (!data.success) {
      return null
    }
    
    return data.user as User
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

'use server'

import { supabase } from '@/lib/supabase/supabaseClient';
import { User } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';

// Define the expected return structure for clarity
interface AuthResult {
  success: boolean;
  error: string | null;
  message?: string;
  user?: User;
}

// Supabase admin client for server-side operations
const supabaseUrl = 'https://ocfufnbhqxzwsrxxulup.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZnVmbmJocXh6d3NyeHh1bHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzMzMTQ0NywiZXhwIjoyMDc4OTA3NDQ3fQ.B9JSyL6eTg99732hPbUFazai3tLwqGMf2j9zxUx7mfo'
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

/**
 * Handles administrator sign-in, verifies credentials, and checks for admin privileges
 * by querying the 'profiles' table.
 * * NOTE: The primary key in the 'profiles' table is assumed to be 'user_id', not 'id'.
 */
export async function signInAdmin(email: string, password: string): Promise<AuthResult> {
  try {
    // 1. Sign in with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return {
        success: false,
        error: authError.message || 'Invalid email or password',
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Authentication failed: User data missing',
      };
    }

    // 2. Check user profile for admin privileges
    // FIX: Changed .eq('id', ...) to .eq('user_id', ...) to match the typical Supabase schema
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('user_id', authData.user.id) // <--- FIX APPLIED HERE
      .single();

    if (profileError) {
      console.error('Profile Retrieval Error:', profileError.message);
      // Sign out immediately if profile check fails (security best practice)
      await supabase.auth.signOut(); 
      return {
        success: false,
        error: 'Authorization check failed. Access denied.',
      };
    }

    if (!profile || profile.user_type !== 'A') {
      // Sign out if not admin
      await supabase.auth.signOut();
      return {
        success: false,
        error: 'You lack admin privileges to access this application',
      };
    }

    return {
      success: true,
      message: 'Admin authentication successful',
      user: authData.user,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred during admin sign-in.',
    };
  }
}

/**
 * Signup interface for regular users
 */
export interface SignupData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  nickname: string;
  date_of_birth: string; // ISO date string
  gender: string;
  height: number;
  height_unit: string;
  weight: number;
  weight_unit: string;
  activity_level: string;
  dietary_preference: string;
  allergies?: string[];
  profile_picture?: string;
}

/**
 * Handles user signup, creates auth user and profile entry
 */
export async function signUpUser(signupData: SignupData): Promise<AuthResult> {
  try {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: signupData.email,
      password: signupData.password,
      email_confirm: true, // Auto-confirm email for now
    });

    if (authError) {
      return {
        success: false,
        error: authError.message || 'Failed to create account',
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Failed to create user account',
      };
    }

    // 2. Create profile entry
    const profileData = {
      user_id: authData.user.id,
      email: signupData.email,
      first_name: signupData.first_name,
      last_name: signupData.last_name,
      user_type: 'S',
      nickname: signupData.nickname,
      profile_picture: signupData.profile_picture || null,
      date_of_birth: signupData.date_of_birth,
      gender: signupData.gender,
      subscription_plan: 1,
      subscription_status: 'active',
      subscription_start_date: new Date().toISOString(),
      subscription_end_date: null,
      height: signupData.height,
      height_unit: signupData.height_unit,
      weight: signupData.weight,
      weight_unit: signupData.weight_unit,
      activity_level: signupData.activity_level,
      dietary_preference: signupData.dietary_preference,
      allergies: signupData.allergies || [],
    };

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert(profileData);

    if (profileError) {
      // Rollback: delete auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return {
        success: false,
        error: profileError.message || 'Failed to create profile',
      };
    }

    return {
      success: true,
      message: 'Account created successfully',
      user: authData.user,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred during signup.',
    };
  }
}

/**
 * Handles regular user sign-in (user_type = 'S')
 */
export async function signInUser(email: string, password: string): Promise<AuthResult> {
  try {
    // 1. Sign in with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return {
        success: false,
        error: authError.message || 'Invalid email or password',
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Authentication failed: User data missing',
      };
    }

    // 2. Check user profile for regular user type
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('user_id', authData.user.id)
      .single();

    if (profileError) {
      console.error('Profile Retrieval Error:', profileError.message);
      await supabase.auth.signOut();
      return {
        success: false,
        error: 'Authorization check failed. Access denied.',
      };
    }

    if (!profile || profile.user_type !== 'S') {
      // Sign out if not a regular user
      await supabase.auth.signOut();
      return {
        success: false,
        error: 'This account is not authorized to access this area',
      };
    }

    return {
      success: true,
      message: 'Sign in successful',
      user: authData.user,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred during sign-in.',
    };
  }
}
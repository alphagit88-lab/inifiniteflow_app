import { supabase } from '@/lib/supabase/supabaseClient';
import { User } from '@supabase/supabase-js';

// Define the expected return structure for clarity
interface AuthResult {
  success: boolean;
  error: string | null;
  message?: string;
  user?: User;
}

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
import { createClientSupabase } from "./supabase";

// Client-side authentication functions
export async function signOutUser() {
  const supabase = createClientSupabase();

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Error in signOut:", error);
    return { success: false, error: "Failed to sign out" };
  }
}

export async function signInUser(email: string, password: string) {
  const supabase = createClientSupabase();

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Error signing in:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data, error: null };
  } catch (error) {
    console.error("Error in signIn:", error);
    return { success: false, error: "Failed to sign in" };
  }
}

export async function signUpUser(email: string, password: string) {
  const supabase = createClientSupabase()
  
  // Get the correct redirect URL for current environment
  const redirectUrl = process.env.NODE_ENV === 'production'
    ? `${process.env.NEXTAUTH_URL}/auth/callback`
    : `${window.location.origin}/auth/callback`
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    })
    
    if (error) {
      console.error('Error signing up:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, data, error: null }
  } catch (error) {
    console.error('Error in signUp:', error)
    return { success: false, error: 'Failed to sign up' }
  }
}

export async function resetUserPassword(email: string) {
  const supabase = createClientSupabase()
  
  // Get the correct redirect URL for current environment
  const redirectUrl = process.env.NODE_ENV === 'production'
    ? `${process.env.NEXTAUTH_URL}/auth/reset-password`
    : `${window.location.origin}/auth/reset-password`
  
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    })
    
    if (error) {
      console.error('Error resetting password:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, error: null }
  } catch (error) {
    console.error('Error in resetPassword:', error)
    return { success: false, error: 'Failed to reset password' }
  }
}

// Client-side user getter
export async function getClientUser() {
  const supabase = createClientSupabase();

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Error getting user:", error);
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error in getClientUser:", error);
    return null;
  }
}

// Validation helpers (shared)
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }

  if (!/(?=.*[a-z])/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/(?=.*\d)/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

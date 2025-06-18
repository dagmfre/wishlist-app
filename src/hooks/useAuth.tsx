"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { User } from "@supabase/supabase-js";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import {
  signOutUser,
  signInUser,
  signUpUser,
  resetUserPassword,
} from "@/lib/auth";

interface AuthResult {
  success: boolean;
  error?: string | null;
  data?: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string | null }>;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (
    email: string
  ) => Promise<{ success: boolean; error?: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Memoize the auth state change handler
  const handleAuthStateChange = useCallback(
    (event: any, session: any) => {
      const newUser = session?.user ?? null;

      // Only update if user actually changed
      setUser((prevUser) => {
        if (prevUser?.id !== newUser?.id) {
          return newUser;
        }
        return prevUser;
      });

      setLoading(false);

      // Only handle navigation if this is not the initial session load
      if (initialized) {
        if (event === "SIGNED_IN" && newUser) {
          router.push("/wishlist");
        } else if (event === "SIGNED_OUT") {
          router.push("/");
        }
      }
    },
    [router, initialized]
  );

  useEffect(() => {
    let mounted = true;

    // Get initial user
    const getUser = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
        } else {
          setUser(user);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    getUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event: string, session: { user: User | null } | null) => {
        setUser(session?.user ?? null);
        setLoading(false);
        setError(null);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase.auth, handleAuthStateChange]);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await signInUser(email, password);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          setError(error.message);
          return { success: false, error: error.message };
        }

        return { success: true, data };
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "An error occurred";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [supabase.auth]
  );

  useEffect(() => {
    let isMounted = true;

    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (isMounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase.auth]);
  // ...existing code...

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await signOutUser();
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    return await resetUserPassword(email);
  }, []);

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

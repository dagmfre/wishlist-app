import { createClient } from "@supabase/supabase-js";
import {
  createClientComponentClient,
  createServerComponentClient,
} from "@supabase/auth-helpers-nextjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Basic client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client component helper (for use in 'use client' components)
export const createClientSupabase = () => createClientComponentClient();

// Server component helper (only call this in server components)
export const createServerSupabase = async () => {
  const { cookies } = await import("next/headers");
  return createServerComponentClient({ cookies });
};

// Alternative server helper that doesn't require cookies immediately
export const getServerSupabaseClient = async () => {
  const { cookies } = await import("next/headers");
  return createServerComponentClient({ cookies });
};

// Type definitions for our database
export type WishlistItem = {
  id: string;
  user_id: string;
  title: string;
  link?: string;
  description?: string;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      wishlist_items: {
        Row: WishlistItem;
        Insert: Omit<WishlistItem, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<WishlistItem, "id" | "created_at" | "updated_at">>;
      };
    };
  };
};

// User type from Supabase Auth
export type User = {
  id: string;
  email?: string;
  created_at: string;
  updated_at: string;
};

// Auth state type
export type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
};

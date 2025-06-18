import {
  createClientSupabase,
  createServerSupabase,
  WishlistItem,
} from "./supabase";
import { User } from "@supabase/supabase-js";
import { apiClient, ApiResponse } from "./api";

// Client-side wishlist service (can use either Supabase direct or API routes)
export class WishlistService {
  private supabase;
  private useApiRoutes: boolean;

  constructor(useApiRoutes: boolean = false) {
    this.supabase = createClientSupabase();
    this.useApiRoutes = useApiRoutes;
  }

  async getWishlistItems(
    userId: string
  ): Promise<{ data: WishlistItem[] | null; error: string | null }> {
    if (this.useApiRoutes) {
      const response = await apiClient.getWishlistItems();
      return {
        data: response.success ? response.data || [] : null,
        error: response.success
          ? null
          : response.error || "Failed to fetch items",
      };
    }

    try {
      const { data, error } = await this.supabase
        .from("wishlist_items")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching wishlist items:", error);
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (err) {
      console.error("Unexpected error fetching wishlist items:", err);
      return { data: null, error: "Failed to fetch wishlist items" };
    }
  }

  async addWishlistItem(
    item: Omit<WishlistItem, "id" | "created_at" | "updated_at">
  ): Promise<{ data: WishlistItem | null; error: string | null }> {
    if (this.useApiRoutes) {
      const response = await apiClient.createWishlistItem(item);
      return {
        data: response.success ? response.data || null : null,
        error: response.success
          ? null
          : response.error || "Failed to create item",
      };
    }

    try {
      const { data, error } = await this.supabase
        .from("wishlist_items")
        .insert([item])
        .select()
        .single();

      if (error) {
        console.error("Error adding wishlist item:", error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      console.error("Unexpected error adding wishlist item:", err);
      return { data: null, error: "Failed to add wishlist item" };
    }
  }

  async updateWishlistItem(
    id: string,
    updates: Partial<
      Omit<WishlistItem, "id" | "user_id" | "created_at" | "updated_at">
    >
  ): Promise<{ data: WishlistItem | null; error: string | null }> {
    if (this.useApiRoutes) {
      const response = await apiClient.updateWishlistItem(id, updates);
      return {
        data: response.success ? response.data || null : null,
        error: response.success
          ? null
          : response.error || "Failed to update item",
      };
    }

    try {
      const { data, error } = await this.supabase
        .from("wishlist_items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating wishlist item:", error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      console.error("Unexpected error updating wishlist item:", err);
      return { data: null, error: "Failed to update wishlist item" };
    }
  }

  async deleteWishlistItem(
    id: string
  ): Promise<{ success: boolean; error: string | null }> {
    if (this.useApiRoutes) {
      const response = await apiClient.deleteWishlistItem(id);
      return {
        success: response.success,
        error: response.success
          ? null
          : response.error || "Failed to delete item",
      };
    }

    try {
      const { error } = await this.supabase
        .from("wishlist_items")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting wishlist item:", error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (err) {
      console.error("Unexpected error deleting wishlist item:", err);
      return { success: false, error: "Failed to delete wishlist item" };
    }
  }

  // Real-time subscription for wishlist changes (only works with direct Supabase)
  subscribeToWishlistChanges(userId: string, callback: (payload: any) => void) {
    if (this.useApiRoutes) {
      console.warn("Real-time subscriptions not available with API routes");
      return () => {};
    }

    const channel = this.supabase
      .channel("wishlist_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "wishlist_items",
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();

    return () => {
      this.supabase.removeChannel(channel);
    };
  }
}

// Server-side wishlist functions
export async function getServerWishlistItems(
  user: User
): Promise<{ data: WishlistItem[] | null; error: string | null }> {
  try {
    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from("wishlist_items")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching wishlist items:", error);
      return { data: null, error: error.message };
    }

    return { data: data || [], error: null };
  } catch (err) {
    console.error("Unexpected error fetching wishlist items:", err);
    return { data: null, error: "Failed to fetch wishlist items" };
  }
}

// Validation functions (keeping existing ones for backward compatibility)
export function validateWishlistItem(item: {
  title: string;
  link?: string;
  description?: string;
}): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!item.title || item.title.trim().length === 0) {
    errors.title = "Title is required";
  } else if (item.title.trim().length > 200) {
    errors.title = "Title must be less than 200 characters";
  }

  if (item.link && item.link.trim().length > 0) {
    try {
      new URL(item.link);
    } catch {
      errors.link = "Please enter a valid URL";
    }
  }

  if (item.description && item.description.trim().length > 1000) {
    errors.description = "Description must be less than 1000 characters";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

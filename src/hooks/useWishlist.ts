"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { WishlistItem } from "@/lib/supabase";
import { WishlistService, validateWishlistItem } from "@/lib/wishlist";
import { useAuth } from "./useAuth";

interface UseWishlistReturn {
  items: WishlistItem[];
  loading: boolean;
  error: string | null;
  addItem: (
    item: Omit<WishlistItem, "id" | "user_id" | "created_at" | "updated_at">
  ) => Promise<{ success: boolean; error?: string }>;
  updateItem: (
    id: string,
    updates: Partial<
      Omit<WishlistItem, "id" | "user_id" | "created_at" | "updated_at">
    >
  ) => Promise<{ success: boolean; error?: string }>;
  deleteItem: (id: string) => Promise<{ success: boolean; error?: string }>;
  refreshItems: () => Promise<void>;
}

export function useWishlist(): UseWishlistReturn {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const wishlistService = useMemo(() => new WishlistService(), []);

  const fetchItems = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await wishlistService.getWishlistItems(
      user.id
    );

    if (fetchError) {
      setError(fetchError);
      setItems([]);
    } else {
      setItems(data || []);
    }

    setLoading(false);
  }, [user, wishlistService]);

  const addItem = useCallback(
    async (
      item: Omit<WishlistItem, "id" | "user_id" | "created_at" | "updated_at">
    ) => {
      if (!user) {
        return { success: false, error: "User not authenticated" };
      }

      // Validate item
      const validation = validateWishlistItem(item);
      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0];
        return { success: false, error: firstError };
      }

      const { data, error } = await wishlistService.addWishlistItem({
        ...item,
        user_id: user.id,
      });

      if (error) {
        return { success: false, error };
      }

      // Optimistic update
      if (data) {
        setItems((prev) => [data, ...prev]);
      }

      return { success: true };
    },
    [user, wishlistService]
  );

  const updateItem = useCallback(
    async (
      id: string,
      updates: Partial<
        Omit<WishlistItem, "id" | "user_id" | "created_at" | "updated_at">
      >
    ) => {
      // Validate updates
      const validation = validateWishlistItem({ title: "", ...updates } as any);
      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0];
        return { success: false, error: firstError };
      }

      const { data, error } = await wishlistService.updateWishlistItem(
        id,
        updates
      );

      if (error) {
        return { success: false, error };
      }

      // Optimistic update
      if (data) {
        setItems((prev) => prev.map((item) => (item.id === id ? data : item)));
      }

      return { success: true };
    },
    [wishlistService]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      const { success, error } = await wishlistService.deleteWishlistItem(id);

      if (!success) {
        return { success: false, error: error || undefined };
      }

      // Optimistic update
      setItems((prev) => prev.filter((item) => item.id !== id));

      return { success: true };
    },
    [wishlistService]
  );

  const refreshItems = useCallback(async () => {
    await fetchItems();
  }, [fetchItems]);

  // Initial fetch
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const unsubscribe = wishlistService.subscribeToWishlistChanges(
      user.id,
      (payload: Record<string, unknown>) => {
        const {
          eventType,
          new: newRecord,
          old: oldRecord,
        } = payload as {
          eventType: string;
          new: WishlistItem;
          old: WishlistItem;
        };

        switch (eventType) {
          case "INSERT":
            setItems((prev) => {
              // Avoid duplicates
              if (prev.some((item) => item.id === newRecord.id)) return prev;
              return [newRecord, ...prev];
            });
            break;
          case "UPDATE":
            setItems((prev) =>
              prev.map((item) => (item.id === newRecord.id ? newRecord : item))
            );
            break;
          case "DELETE":
            setItems((prev) => prev.filter((item) => item.id !== oldRecord.id));
            break;
        }
      }
    );

    return unsubscribe;
  }, [user, wishlistService]);

  return {
    items,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    refreshItems,
  };
}

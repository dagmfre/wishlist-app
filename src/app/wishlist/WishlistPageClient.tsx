"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";
import AddItemForm from "./AddItemForm";
import WishlistGrid from "./WishlistGrid";
import { WishlistService, validateWishlistItem } from "@/lib/wishlist";
import { WishlistItem, User } from "@/lib/supabase";

interface Props {
  initialUser: User;
}

export default function WishlistPageClient({ initialUser }: Props) {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Use the current user from auth hook, fallback to initial user
  const currentUser = user || initialUser;

  const fetchItems = useCallback(async () => {
    if (!currentUser?.id) return;

    setLoading(true);
    try {
      const wishlistService = new WishlistService(true);
      const result = await wishlistService.getWishlistItems(currentUser.id);

      if (result.error) {
        setError(result.error);
      } else {
        setItems(result.data || []);
        setError(null);
      }
    } catch (err) {
      console.error("Error fetching items:", err);
      setError("Failed to load wishlist items");
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (!authLoading && currentUser?.id) {
      fetchItems();
    }
  }, [authLoading, currentUser?.id, fetchItems]);

  const handleAddItem = async (
    itemData: Omit<WishlistItem, "id" | "user_id" | "created_at" | "updated_at">
  ) => {
    try {
      // Convert undefined to null for API consistency
      const apiData = {
        title: itemData.title,
        link: itemData.link || null,
        description: itemData.description || null,
      };

      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to add item");
      }

      const data = await response.json();

      if (data.success) {
        setItems((prev) => [data.data, ...prev]);
        setShowAddForm(false);
        return { success: true, data: data.data };
      } else {
        throw new Error(data.error || "Failed to add item");
      }
    } catch (err) {
      console.error("Error adding item:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to add item",
      };
    }
  };

  const handleUpdateItem = async (
    id: string,
    updates: Partial<WishlistItem>
  ) => {
    try {
      // Validate the updates before sending
      const validation = validateWishlistItem({
        title: updates.title || "",
        link: updates.link,
        description: updates.description,
      });

      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0];
        return { success: false, error: firstError };
      }

      // Prepare the update data - only send defined fields
      const updateData: Record<string, string | null> = {};
      if (updates.title !== undefined) updateData.title = updates.title.trim();
      if (updates.link !== undefined)
        updateData.link = updates.link?.trim() || null;
      if (updates.description !== undefined)
        updateData.description = updates.description?.trim() || null;

      const response = await fetch(`/api/wishlist/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.success && data.data) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, ...data.data } : item
          )
        );
        return { success: true, data: data.data };
      } else {
        throw new Error(data.error || "Failed to update item");
      }
    } catch (err) {
      console.error("Error updating item:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to update item",
      };
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const response = await fetch(`/api/wishlist/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete item");
      }

      const data = await response.json();

      if (data.success) {
        setItems((prev) => prev.filter((item) => item.id !== id));
        return { success: true };
      } else {
        throw new Error(data.error || "Failed to delete item");
      }
    } catch (err) {
      console.error("Error deleting item:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to delete item",
      };
    }
  };

  // Show loading state only on initial load
  if (authLoading || (loading && items.length === 0)) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="container-custom py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-400">Loading your wishlist...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if no user (should not happen due to server-side auth check)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="container-custom py-8">
          <div className="text-center">
            <p className="text-gray-400">
              Please sign in to view your wishlist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <main className="container-custom py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                My Wishlist
              </h1>
              <p className="text-gray-400">
                {items.length === 0
                  ? "Start building your wishlist by adding your first item!"
                  : `You have ${items.length} item${
                      items.length === 1 ? "" : "s"
                    } in your wishlist`}
              </p>
            </div>

            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center cursor-pointer transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Item
            </button>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-red-300">{error}</span>
                <button
                  onClick={fetchItems}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm cursor-pointer transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Add Item Form Modal */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
              <div className="bg-gray-900 rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-700">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">
                      Add New Item
                    </h2>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="text-gray-400 hover:text-gray-200 p-1 cursor-pointer transition-colors"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <AddItemForm
                    onSubmit={handleAddItem}
                    onCancel={() => setShowAddForm(false)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Wishlist Content */}
          {loading && items.length > 0 ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : (
            <WishlistGrid
              items={items}
              onUpdate={handleUpdateItem}
              onDelete={async (id: string) => {
                await handleDeleteItem(id);
              }}
              loading={loading}
            />
          )}
        </div>
      </main>
    </div>
  );
}

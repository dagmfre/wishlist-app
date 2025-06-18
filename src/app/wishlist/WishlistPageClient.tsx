'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { WishlistService } from '@/lib/wishlist'
import { User } from '@supabase/supabase-js'
import Header from '@/components/layout/Header'
import AddItemForm from './AddItemForm'
import WishlistGrid from './WishlistGrid' 
import { WishlistItem } from '@/lib/supabase'

interface Props {
  initialUser: User
}

export default function WishlistPageClient({ initialUser }: Props) {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Use the current user from auth hook, fallback to initial user
  const currentUser = user || initialUser;

  const wishlistService = new WishlistService(true); // Use API routes to avoid server/client issues

  const fetchItems = async () => {
    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/wishlist", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch wishlist items");
      }

      const data = await response.json();

      if (data.success) {
        setItems(data.data || []);
      } else {
        throw new Error(data.error || "Failed to fetch items");
      }
    } catch (err) {
      console.error("Error fetching wishlist items:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load wishlist items"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch items when component mounts or user changes
  useEffect(() => {
    if (currentUser && !authLoading) {
      fetchItems();
    }
  }, [currentUser?.id, authLoading]); // Only depend on user ID to prevent infinite loops

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
        throw new Error("Failed to add item");
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
      const response = await fetch(`/api/wishlist/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update item");
      }

      const data = await response.json();

      if (data.success) {
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
        throw new Error("Failed to delete item");
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
      <div className="min-h-screen bg-secondary-50">
        <Header />
        <div className="container-custom py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
              <p className="text-secondary-600">Loading your wishlist...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if no user (should not happen due to server-side auth check)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <Header />
        <div className="container-custom py-8">
          <div className="text-center">
            <p className="text-secondary-600">
              Please sign in to view your wishlist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />

      <main className="container-custom py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="page-header">My Wishlist</h1>
              <p className="text-secondary-600">
                {items.length === 0
                  ? "Start building your wishlist by adding your first item!"
                  : `You have ${items.length} item${
                      items.length === 1 ? "" : "s"
                    } in your wishlist`}
              </p>
            </div>

            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary flex items-center"
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
            <div className="alert alert-error mb-6">
              <div className="flex items-center justify-between">
                <span>{error}</span>
                <button onClick={fetchItems} className="btn-secondary btn-sm">
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Add Item Form Modal */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-strong max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-secondary-900">
                      Add New Item
                    </h2>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="text-secondary-500 hover:text-secondary-700 p-1"
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
              <div className="loading-spinner w-6 h-6 mx-auto"></div>
            </div>
          ) : (
            <WishlistGrid
              items={items}
              onUpdate={handleUpdateItem}
              onDelete={handleDeleteItem}
              loading={loading}
            />
          )}
        </div>
      </main>
    </div>
  );
}

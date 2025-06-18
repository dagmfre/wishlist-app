"use client";

import { useState } from "react";
import { WishlistItem } from "@/lib/supabase";
import WishlistItemCard from "./WishlistItemCard";
import EditItemModal from "./EditItemModal";

interface WishlistGridProps {
  items: WishlistItem[];
  onUpdate: (
    id: string,
    updates: Record<string, string | undefined>
  ) => Promise<{ success: boolean; error?: string }>;
  onDelete: (id: string) => Promise<void>;
  loading: boolean;
}

export default function WishlistGrid({
  items,
  onUpdate,
  onDelete,
  loading,
}: WishlistGridProps) {
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );

  const handleEdit = (item: WishlistItem) => {
    setEditingItem(item);
  };

  const handleSaveEdit = async (updates: Partial<WishlistItem>) => {
    if (!editingItem)
      return { success: false, error: "No item selected for editing" };

    const result = await onUpdate(editingItem.id, updates);

    if (result.success) {
      setEditingItem(null);
    }

    return result;
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setShowDeleteConfirm(null);

    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteConfirm = (id: string) => {
    setShowDeleteConfirm(id);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  // Empty state
  if (!loading && items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-12 h-12 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-secondary-900 mb-2">
            Your wishlist is empty
          </h3>
          <p className="text-secondary-600 mb-6">
            Start adding items you love and want to remember. Click the
            &quot;Add Item&quot; button to get started!
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-secondary-500">
            <div className="flex items-center">
              <svg
                className="w-4 h-4 mr-2"
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
              Add items
            </div>
            <div className="flex items-center">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              Save links
            </div>
            <div className="flex items-center">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
              Organize
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading && items.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="card animate-pulse">
            <div className="h-4 bg-secondary-200 rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-secondary-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-2 mb-4">
              <div className="h-3 bg-secondary-200 rounded"></div>
              <div className="h-3 bg-secondary-200 rounded w-5/6"></div>
            </div>
            <div className="flex justify-between">
              <div className="h-8 bg-secondary-200 rounded w-16"></div>
              <div className="h-8 bg-secondary-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <WishlistItemCard
            key={item.id}
            item={item}
            onEdit={handleEdit}
            onDelete={handleDeleteConfirm}
            isDeleting={deletingId === item.id}
            animationDelay={index * 0.1}
          />
        ))}
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <EditItemModal
          item={editingItem}
          onSave={handleSaveEdit}
          onCancel={() => setEditingItem(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-strong max-w-md w-full animate-fade-in">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-danger-100 rounded-full flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-danger-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900">
                    Delete Item
                  </h3>
                  <p className="text-secondary-600 text-sm">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <p className="text-secondary-700 mb-6">
                Are you sure you want to delete &quot;
                <span className="font-medium">
                  {items.find((item) => item.id === showDeleteConfirm)?.title}
                </span>
                &quot; from your wishlist?
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  disabled={deletingId === showDeleteConfirm}
                  className="btn-danger flex items-center justify-center flex-1 order-2 sm:order-1"
                >
                  {deletingId === showDeleteConfirm && (
                    <div className="loading-spinner mr-2"></div>
                  )}
                  {deletingId === showDeleteConfirm ? "Deleting..." : "Delete"}
                </button>

                <button
                  onClick={handleCancelDelete}
                  disabled={deletingId === showDeleteConfirm}
                  className="btn-secondary flex items-center justify-center flex-1 order-1 sm:order-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

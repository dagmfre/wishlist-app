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
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-12 h-12 text-gray-600"
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
          <h3 className="text-xl font-semibold text-white mb-2">
            Your wishlist is empty
          </h3>
          <p className="text-gray-400 mb-6">
            Start adding items you love to your wishlist!
          </p>
        </div>
      </div>
    );
  }

  // Loading skeleton
  if (loading && items.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-900 border border-gray-700 rounded-lg p-6 animate-pulse"
          >
            <div className="space-y-4">
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-700 rounded"></div>
                <div className="h-3 bg-gray-700 rounded w-5/6"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-8 bg-gray-700 rounded w-16"></div>
                <div className="h-8 bg-gray-700 rounded w-16"></div>
              </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg shadow-2xl max-w-md w-full border border-gray-700 animate-fade-in">
            <div className="p-6">
              {/* Header with Icon */}
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-red-900/50 border border-red-700 rounded-full flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-red-400"
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
                  <h3 className="text-lg font-semibold text-white">
                    Delete Item
                  </h3>
                  <p className="text-gray-400 text-sm">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              {/* Confirmation Message */}
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-medium text-white">
                  "{items.find((item) => item.id === showDeleteConfirm)?.title}"
                </span>{" "}
                from your wishlist?
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  disabled={deletingId === showDeleteConfirm}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium cursor-pointer transition-colors flex items-center justify-center flex-1 order-2 sm:order-1"
                >
                  {deletingId === showDeleteConfirm && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  )}
                  {deletingId === showDeleteConfirm
                    ? "Deleting..."
                    : "Delete Item"}
                </button>

                <button
                  onClick={handleCancelDelete}
                  disabled={deletingId === showDeleteConfirm}
                  className="border border-gray-600 text-gray-300 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3 rounded-lg font-medium cursor-pointer transition-colors flex items-center justify-center flex-1 order-1 sm:order-2"
                >
                  Cancel
                </button>
              </div>

              {/* Keyboard Shortcut Hint */}
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-xs text-gray-500 text-center">
                  Press{" "}
                  <kbd className="bg-gray-700 px-2 py-1 rounded text-xs">
                    Esc
                  </kbd>{" "}
                  to cancel
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

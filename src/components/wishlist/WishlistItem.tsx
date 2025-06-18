"use client";

import { useState } from "react";
import { WishlistItem as WishlistItemType } from "@/lib/supabase";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import WishlistForm from "./WishlistForm";
import { formatRelativeTime, isValidUrl } from "@/hooks/utils";

interface WishlistItemProps {
  item: WishlistItemType;
  onUpdate: (
    id: string,
    updates: Partial<
      Omit<WishlistItemType, "id" | "user_id" | "created_at" | "updated_at">
    >
  ) => Promise<{ success: boolean; error?: string }>;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export default function WishlistItem({
  item,
  onUpdate,
  onDelete,
}: WishlistItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleUpdate = async (updates: {
    title: string;
    link?: string;
    description?: string;
  }) => {
    const result = await onUpdate(item.id, updates);
    if (result.success) {
      setIsEditing(false);
    }
    return result;
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await onDelete(item.id);
      if (!result.success) {
        console.error("Failed to delete item:", result.error);
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isEditing) {
    return (
      <WishlistForm
        initialData={{
          title: item.title,
          link: item.link || "",
          description: item.description || "",
        }}
        onSubmit={handleUpdate}
        submitLabel="Update Item"
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <Card hover className="transition-all duration-200">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-secondary-900 mb-2 break-words">
            {item.title}
          </h3>

          {item.link && (
            <a
              href={isValidUrl(item.link) ? item.link : `https://${item.link}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm mb-2 break-all"
            >
              <svg
                className="w-4 h-4 mr-1 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              View Link
            </a>
          )}

          {item.description && (
            <p className="text-secondary-600 text-sm mb-3 break-words">
              {item.description}
            </p>
          )}

          <p className="text-xs text-secondary-500">
            Added {formatRelativeTime(item.created_at)}
            {item.updated_at !== item.created_at && (
              <span> • Updated {formatRelativeTime(item.updated_at)}</span>
            )}
          </p>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditing(true)}
            title="Edit item"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowDeleteConfirm(true)}
            title="Delete item"
            className="text-danger-600 hover:text-danger-700 hover:bg-danger-50"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              Delete Wishlist Item
            </h3>
            <p className="text-secondary-600 mb-6">
              Are you sure you want to delete "{item.title}"? This action cannot
              be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="danger"
                onClick={handleDelete}
                loading={isDeleting}
                className="flex-1"
              >
                Delete
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
}

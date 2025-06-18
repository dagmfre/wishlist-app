"use client";

import { WishlistItem as WishlistItemType } from "@/lib/supabase";
import WishlistItem from "./WishlistItem";

interface WishlistListProps {
  items: WishlistItemType[];
  loading: boolean;
  error: string | null;
  onUpdate: (
    id: string,
    updates: Partial<
      Omit<WishlistItemType, "id" | "user_id" | "created_at" | "updated_at">
    >
  ) => Promise<{ success: boolean; error?: string }>;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
  onRefresh: () => Promise<void>;
}

export default function WishlistList({
  items,
  loading,
  error,
  onUpdate,
  onDelete,
  onRefresh,
}: WishlistListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-4 bg-secondary-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-secondary-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-secondary-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="alert alert-error max-w-md mx-auto">
          <p className="mb-4">{error}</p>
          <button onClick={onRefresh} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-secondary-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-secondary-900 mb-2">
          Your wishlist is empty
        </h3>
        <p className="text-secondary-600">
          Add your first item to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <WishlistItem
          key={item.id}
          item={item}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

"use client";

import { useState } from "react";
import { validateWishlistItem } from "@/lib/wishlist";
import { WishlistItem } from "@/lib/supabase";

interface AddItemFormProps {
  onSubmit: (
    itemData: Omit<WishlistItem, "id" | "user_id" | "created_at" | "updated_at">
  ) => Promise<{ success: boolean; error?: string; data?: any }>;
  onCancel: () => void;
}

export default function AddItemForm({ onSubmit, onCancel }: AddItemFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    link: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setErrors({});

    // Validate form data
    const validation = validateWishlistItem(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);

    try {
      // Prepare data for submission - ensure types match WishlistItem from supabase
      const submitData: Omit<
        WishlistItem,
        "id" | "user_id" | "created_at" | "updated_at"
      > = {
        title: formData.title.trim(),
        link: formData.link.trim() || undefined, // Use undefined instead of null
        description: formData.description.trim() || undefined, // Use undefined instead of null
      };

      const result = await onSubmit(submitData);

      if (result.success) {
        // Reset form and close modal
        setFormData({ title: "", link: "", description: "" });
        onCancel();
      } else {
        setErrors({ general: result.error || "Failed to add item" });
      }
    } catch (error) {
      console.error("Error in AddItemForm:", error);
      setErrors({ general: "An unexpected error occurred" });
    } finally {
      setLoading(false);
    }
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Add New Item</h3>
        <button
          onClick={onCancel}
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="Enter item title"
            required
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-400">{errors.title}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
            placeholder="Optional description"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-400">{errors.description}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="link"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Link
          </label>
          <input
            type="url"
            id="link"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="https://example.com"
          />
          {errors.link && (
            <p className="mt-1 text-sm text-red-400">{errors.link}</p>
          )}
        </div>

        {errors.general && (
          <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-sm text-red-300">{errors.general}</p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium cursor-pointer transition-colors"
          >
            {loading ? "Adding..." : "Add Item"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-600 text-gray-300 hover:bg-gray-800 rounded-lg font-medium cursor-pointer transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

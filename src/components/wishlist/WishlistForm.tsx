"use client";

import { useState } from "react";
import { validateWishlistItem } from "@/lib/wishlist";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

interface WishlistFormProps {
  onSubmit: (item: {
    title: string;
    link?: string;
    description?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  initialData?: {
    title: string;
    link?: string;
    description?: string;
  };
  submitLabel?: string;
  onCancel?: () => void;
}

export default function WishlistForm({
  onSubmit,
  initialData,
  submitLabel = "Add Item",
  onCancel,
}: WishlistFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    link: initialData?.link || "",
    description: initialData?.description || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validation = validateWishlistItem(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const result = await onSubmit({
        title: formData.title.trim(),
        link: formData.link.trim() || undefined,
        description: formData.description.trim() || undefined,
      });

      if (result.success) {
        // Reset form if this is an add form (no initial data)
        if (!initialData) {
          setFormData({ title: "", link: "", description: "" });
        }
        onCancel?.();
      } else {
        setErrors({ general: result.error || "Failed to save item" });
      }
    } catch (err) {
      setErrors({ general: "An unexpected error occurred" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="alert alert-error">{errors.general}</div>
        )}

        <Input
          label="Title *"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter item title"
          error={errors.title}
          disabled={loading}
          required
        />

        <Input
          label="Link (optional)"
          name="link"
          type="url"
          value={formData.link}
          onChange={handleChange}
          placeholder="https://example.com"
          error={errors.link}
          disabled={loading}
        />

        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description (optional)
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Add a description..."
            className={`input-field resize-none h-24 ${
              errors.description ? "input-error" : ""
            }`}
            disabled={loading}
          />
          {errors.description && (
            <p className="form-error">{errors.description}</p>
          )}
        </div>

        <div className="flex gap-3">
          <Button type="submit" loading={loading} className="flex-1">
            {submitLabel}
          </Button>

          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}

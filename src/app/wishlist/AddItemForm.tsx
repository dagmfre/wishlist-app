'use client'

import { useState } from 'react'
import { validateWishlistItem } from '@/lib/wishlist'
import { WishlistItem } from '@/lib/supabase'

interface AddItemFormProps {
  onSubmit: (
    itemData: Omit<WishlistItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => Promise<{ success: boolean; error?: string; data?: any }>
  onCancel: () => void
}

export default function AddItemForm({ onSubmit, onCancel }: AddItemFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    link: '',
    description: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Reset errors
    setErrors({})

    // Validate form data
    const validation = validateWishlistItem(formData)

    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    setLoading(true)

    try {
      // Prepare data for submission - ensure types match WishlistItem from supabase
      const submitData: Omit<WishlistItem, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
        title: formData.title.trim(),
        link: formData.link.trim() || undefined, // Use undefined instead of null
        description: formData.description.trim() || undefined, // Use undefined instead of null
      }

      const result = await onSubmit(submitData)

      if (result.success) {
        // Reset form and close modal
        setFormData({ title: '', link: '', description: '' })
        onCancel()
      } else {
        setErrors({ general: result.error || 'Failed to add item' })
      }
    } catch (error) {
      console.error('Error in AddItemForm:', error)
      setErrors({ general: 'An unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }

  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General Error */}
      {errors.general && (
        <div className="alert alert-error animate-fade-in">
          {errors.general}
        </div>
      )}

      {/* Title Field */}
      <div className="form-group">
        <label htmlFor="title" className="form-label">
          Title *
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          className={`input-field ${errors.title ? 'input-error' : ''}`}
          placeholder="Enter item title"
          disabled={loading}
          autoComplete="off"
          maxLength={100}
        />
        {errors.title && <p className="form-error">{errors.title}</p>}
        <p className="text-xs text-secondary-500 mt-1">
          {formData.title.length}/100 characters
        </p>
      </div>

      {/* Link Field */}
      <div className="form-group">
        <label htmlFor="link" className="form-label">
          Link
          <span className="text-secondary-500 font-normal ml-1">
            (optional)
          </span>
        </label>
        <input
          id="link"
          name="link"
          type="url"
          value={formData.link}
          onChange={handleChange}
          className={`input-field ${errors.link ? 'input-error' : ''}`}
          placeholder="https://example.com"
          disabled={loading}
          autoComplete="url"
        />
        {errors.link && <p className="form-error">{errors.link}</p>}
        {formData.link && !isValidUrl(formData.link) && (
          <p className="text-xs text-secondary-500 mt-1">
            Enter a valid URL starting with http:// or https://
          </p>
        )}
      </div>

      {/* Description Field */}
      <div className="form-group">
        <label htmlFor="description" className="form-label">
          Description
          <span className="text-secondary-500 font-normal ml-1">
            (optional)
          </span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className={`input-field resize-none ${
            errors.description ? 'input-error' : ''
          }`}
          placeholder="Add notes about this item..."
          disabled={loading}
          rows={4}
          maxLength={500}
        />
        {errors.description && (
          <p className="form-error">{errors.description}</p>
        )}
        <p className="text-xs text-secondary-500 mt-1">
          {formData.description.length}/500 characters
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-secondary-200">
        <button
          type="submit"
          disabled={loading || !formData.title.trim()}
          className="btn-primary flex items-center justify-center flex-1 order-2 sm:order-1"
        >
          {loading && <div className="loading-spinner mr-2"></div>}
          {loading ? 'Adding Item...' : 'Add to Wishlist'}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="btn-secondary flex items-center justify-center flex-1 order-1 sm:order-2"
        >
          Cancel
        </button>
      </div>

      {/* Form Tips */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 text-sm">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-primary-800">
            <p className="font-medium mb-1">Tips for better organization:</p>
            <ul className="space-y-1 text-primary-700">
              <li>• Use descriptive titles to easily find items later</li>
              <li>• Add links to products, articles, or references</li>
              <li>• Include notes about why you want this item</li>
            </ul>
          </div>
        </div>
      </div>
    </form>
  )
}
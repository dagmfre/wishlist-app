'use client'

import { useState, useEffect, useRef } from 'react'
import { validateWishlistItem } from '@/lib/wishlist'
import { WishlistItem } from '@/lib/supabase'

interface EditItemModalProps {
  item: {
    id: string
    title: string
    link?: string | null
    description?: string | null
  }
  onSave: (updates: Record<string, string | undefined>) => Promise<{ success: boolean; error?: string }>
  onCancel: () => void
}

export default function EditItemModal({ item, onSave, onCancel }: EditItemModalProps) {
  const [formData, setFormData] = useState({
    title: item.title,
    link: item.link || '',
    description: item.description || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [showUnsavedChanges, setShowUnsavedChanges] = useState(false)
  
  const titleInputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Focus title input when modal opens
  useEffect(() => {
    const timer = setTimeout(() => {
      titleInputRef.current?.focus()
      titleInputRef.current?.select()
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  const hasChanges = () => {
    return (
      formData.title.trim() !== item.title ||
      (formData.link.trim() || '') !== (item.link || '') ||
      (formData.description.trim() || '') !== (item.description || '')
    )
  }

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [hasChanges, showUnsavedChanges]) // Add dependencies

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        handleCancel()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [hasChanges, showUnsavedChanges]) // Add dependencies

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }

    // Clear general error when user makes changes
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }))
    }
  }

  const handleCancel = () => {
    if (hasChanges() && !showUnsavedChanges) {
      setShowUnsavedChanges(true)
      return
    }
    onCancel()
  }

  const handleDiscardChanges = () => {
    setShowUnsavedChanges(false)
    onCancel()
  }

  const handleKeepEditing = () => {
    setShowUnsavedChanges(false)
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
      // Only send changed fields
      const updates: Partial<WishlistItem> = {}
      
      if (formData.title.trim() !== item.title) {
        updates.title = formData.title.trim()
      }
      
      const newLink = formData.link.trim() || undefined
      const oldLink = item.link || undefined
      if (newLink !== oldLink) {
        updates.link = newLink
      }
      
      const newDescription = formData.description.trim() || undefined
      const oldDescription = item.description || undefined
      if (newDescription !== oldDescription) {
        updates.description = newDescription
      }
      
      // If no changes, just close modal
      if (Object.keys(updates).length === 0) {
        onCancel()
        return
      }
      
      const result = await onSave(updates)
      
      if (!result.success) {
        setErrors({ general: result.error || 'Failed to update item' })
      }
      // Modal will close automatically if successful (handled by parent)
    } catch (error) {
      console.error('Error in EditItemModal:', error)
      setErrors({ general: 'An unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }

  const isValidUrl = (string: string) => {
    if (!string.trim()) return true // Empty is valid (optional)
    try {
      new URL(string)
      return true
    } catch {
      return false
    }
  }

  const getCharacterCountColor = (current: number, max: number) => {
    const percentage = (current / max) * 100
    if (percentage >= 90) return 'text-red-400'
    if (percentage >= 75) return 'text-yellow-400'
    return 'text-gray-400'
  }

  if (showUnsavedChanges) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
        <div className="bg-gray-900 rounded-lg shadow-2xl max-w-md w-full border border-gray-700" ref={modalRef}>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-yellow-900/50 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Unsaved Changes
                </h3>
                <p className="text-gray-400 text-sm">
                  You have unsaved changes
                </p>
              </div>
            </div>

            <p className="text-gray-300 mb-6">
              Do you want to discard your changes? This action cannot be undone.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDiscardChanges}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors flex items-center justify-center flex-1 order-2 sm:order-1"
              >
                Discard Changes
              </button>
              
              <button
                onClick={handleKeepEditing}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors flex items-center justify-center flex-1 order-1 sm:order-2"
              >
                Keep Editing
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-700" ref={modalRef}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Edit Item
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Update your wishlist item details
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-200 hover:bg-gray-800 p-2 rounded-lg transition-colors cursor-pointer"
              disabled={loading}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-900/50 border border-red-700 rounded-lg p-3">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-red-300">{errors.general}</span>
                </div>
              </div>
            )}

            {/* Title Field */}
            <div>
              <label htmlFor="edit-title" className="block text-sm font-medium text-gray-300 mb-2">
                Title *
              </label>
              <input
                ref={titleInputRef}
                id="edit-title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.title ? 'border-red-500' : 'border-gray-600'}`}
                placeholder="Enter item title"
                disabled={loading}
                autoComplete="off"
                maxLength={100}
              />
              {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title}</p>}
              <p className={`text-xs mt-1 ${getCharacterCountColor(formData.title.length, 100)}`}>
                {formData.title.length}/100 characters
              </p>
            </div>

            {/* Link Field */}
            <div>
              <label htmlFor="edit-link" className="block text-sm font-medium text-gray-300 mb-2">
                Link
                <span className="text-gray-500 font-normal ml-1">(optional)</span>
              </label>
              <input
                id="edit-link"
                name="link"
                type="url"
                value={formData.link}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.link ? 'border-red-500' : 'border-gray-600'}`}
                placeholder="https://example.com"
                disabled={loading}
                autoComplete="url"
              />
              {errors.link && <p className="mt-1 text-sm text-red-400">{errors.link}</p>}
              {formData.link && !isValidUrl(formData.link) && (
                <p className="text-xs text-yellow-400 mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Enter a valid URL starting with http:// or https://
                </p>
              )}
              {formData.link && isValidUrl(formData.link) && (
                <p className="text-xs text-green-400 mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Valid URL
                </p>
              )}
            </div>

            {/* Description Field */}
            <div>
              <label htmlFor="edit-description" className="block text-sm font-medium text-gray-300 mb-2">
                Description
                <span className="text-gray-500 font-normal ml-1">(optional)</span>
              </label>
              <textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${errors.description ? 'border-red-500' : 'border-gray-600'}`}
                placeholder="Add notes about this item..."
                disabled={loading}
                rows={4}
                maxLength={500}
              />
              {errors.description && <p className="mt-1 text-sm text-red-400">{errors.description}</p>}
              <p className={`text-xs mt-1 ${getCharacterCountColor(formData.description.length, 500)}`}>
                {formData.description.length}/500 characters
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-700">
              <button
                type="submit"
                disabled={loading || !formData.title.trim() || !hasChanges()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium cursor-pointer transition-colors flex items-center justify-center flex-1 order-2 sm:order-1"
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                )}
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="border border-gray-600 text-gray-300 hover:bg-gray-800 px-4 py-3 rounded-lg font-medium cursor-pointer transition-colors flex items-center justify-center flex-1 order-1 sm:order-2"
              >
                Cancel
              </button>
            </div>

            {/* Keyboard Shortcuts Help */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-xs text-gray-400">
              <div className="flex items-center justify-between">
                <span className="font-medium">Keyboard shortcuts:</span>
                <div className="flex items-center space-x-4">
                  <span><kbd className="bg-gray-700 px-2 py-1 rounded text-xs">Esc</kbd> Cancel</span>
                  <span><kbd className="bg-gray-700 px-2 py-1 rounded text-xs">Ctrl</kbd> + <kbd className="bg-gray-700 px-2 py-1 rounded text-xs">Enter</kbd> Save</span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
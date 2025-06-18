'use client'

import { WishlistItem } from "@/lib/supabase"
import Image from "next/image"


interface WishlistItemCardProps {
  item: WishlistItem
  onEdit: (item: WishlistItem) => void
  onDelete: (id: string) => void
  isDeleting: boolean
  animationDelay?: number
}

export default function WishlistItemCard({ 
  item, 
  onEdit, 
  onDelete, 
  isDeleting,
  animationDelay = 0
}: WishlistItemCardProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) return 'Yesterday'
      if (diffDays < 7) return `${diffDays} days ago`
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
      if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`
      return `${Math.ceil(diffDays / 365)} years ago`
    } catch {
      return 'Recently'
    }
  }

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const getDomainFromUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname
      return domain.replace('www.', '')
    } catch {
      return url
    }
  }

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`
    } catch {
      return null
    }
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  return (
    <div 
      className="card card-hover group animate-fade-in transition-all duration-300 hover:shadow-lg"
      style={{ animationDelay: `${animationDelay}s` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-secondary-900 leading-tight group-hover:text-primary-700 transition-colors duration-200">
          {truncateText(item.title, 60)}
        </h3>
        
        {/* Actions Menu */}
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-200 ml-2">
          <button
            onClick={() => onEdit(item)}
            className="p-2 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 flex-shrink-0"
            title="Edit item"
            disabled={isDeleting}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          
          <button
            onClick={() => onDelete(item.id)}
            disabled={isDeleting}
            className="p-2 text-secondary-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            title="Delete item"
          >
            {isDeleting ? (
              <div className="w-4 h-4 border-2 border-danger-300 border-t-danger-600 rounded-full animate-spin"></div>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Link */}
      {item.link && (
        <div className="mb-3">
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm group/link bg-primary-50 hover:bg-primary-100 rounded-lg px-3 py-2 transition-all duration-200 max-w-full"
          >
            {isValidUrl(item.link) && getFaviconUrl(item.link) && (
              <Image 
                src={getFaviconUrl(item.link)!} 
                alt="favicon" 
                width={16}
                height={16}
                className="mr-2 flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            )}
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span className="group-hover/link:underline truncate font-medium">
              {isValidUrl(item.link) ? getDomainFromUrl(item.link) : truncateText(item.link, 30)}
            </span>
            <svg className="w-3 h-3 ml-2 opacity-70 flex-shrink-0 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}

      {/* Description */}
      {item.description && (
        <div className="mb-4">
          <p className="text-secondary-600 text-sm leading-relaxed">
            {truncateText(item.description, 120)}
          </p>
        </div>
      )}

      {/* Tags/Categories (if you want to add this feature later) */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Placeholder for future tags/categories */}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-secondary-200 mt-auto">
        <div className="flex items-center text-xs text-secondary-500">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>{formatDate(item.created_at)}</span>
        </div>
        
        {item.updated_at !== item.created_at && (
          <div className="flex items-center text-xs text-secondary-400">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Updated {formatDate(item.updated_at)}</span>
          </div>
        )}
      </div>

      {/* Priority indicator (if you want to add priority feature later) */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {/* Placeholder for priority indicator */}
      </div>
    </div>
  )
}
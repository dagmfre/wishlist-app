import { WishlistItem } from "./supabase";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

// API client class
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = "/api") {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP error! status: ${response.status}`,
        };
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  // Wishlist API methods
  async getWishlistItems(): Promise<ApiResponse<WishlistItem[]>> {
    return this.request<WishlistItem[]>("/wishlist");
  }

  async getWishlistItem(id: string): Promise<ApiResponse<WishlistItem>> {
    return this.request<WishlistItem>(`/wishlist/${id}`);
  }

  async createWishlistItem(
    item: Omit<WishlistItem, "id" | "user_id" | "created_at" | "updated_at">
  ): Promise<ApiResponse<WishlistItem>> {
    return this.request<WishlistItem>("/wishlist", {
      method: "POST",
      body: JSON.stringify(item),
    });
  }

  async updateWishlistItem(
    id: string,
    updates: Partial<
      Omit<WishlistItem, "id" | "user_id" | "created_at" | "updated_at">
    >
  ): Promise<ApiResponse<WishlistItem>> {
    return this.request<WishlistItem>(`/wishlist/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteWishlistItem(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/wishlist/${id}`, {
      method: "DELETE",
    });
  }
}

// Create a default API client instance
export const apiClient = new ApiClient();

// Error handling utilities
export function handleApiError(error: ApiResponse): string {
  return error.error || "An error occurred";
}

export function isApiError(
  response: ApiResponse
): response is ApiResponse & { success: false } {
  return !response.success;
}

// Request/Response transformers
export function transformWishlistItemForApi(
  item: Omit<WishlistItem, "id" | "user_id" | "created_at" | "updated_at">
): Record<string, unknown> {
  return {
    title: item.title,
    link: item.link,
    description: item.description,
  };
}

export function transformApiResponseToWishlistItem(
  apiResponse: Record<string, unknown>
): WishlistItem | null {
  if (!apiResponse || typeof apiResponse !== "object") return null;

  // Add proper validation here
  return apiResponse as WishlistItem;
}

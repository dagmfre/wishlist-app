export interface RequestOptions {
  timeout?: number;
  retries?: number;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: ValidationError[];
  code?: string;
  timestamp?: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: Record<string, any>;
}

// HTTP method types
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// Query parameters type
export interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}

// Pagination parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

// Filter parameters for wishlist items
export interface WishlistItemFilters {
  search?: string;
  hasLink?: boolean;
  hasDescription?: boolean;
  createdAfter?: string;
  createdBefore?: string;
}

// API endpoints enum
export enum ApiEndpoints {
  WISHLIST = "/api/wishlist",
  WISHLIST_ITEM = "/api/wishlist/:id",
  AUTH_SIGNUP = "/api/auth/signup",
  AUTH_LOGIN = "/api/auth/login",
  AUTH_LOGOUT = "/api/auth/logout",
}

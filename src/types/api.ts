export interface RequestOptions extends RequestInit {
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

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

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

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface ApiSuccess<T = unknown> {
  data: T;
  message?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedApiResponse<T = unknown> {
  data: T[];
  meta: PaginationMeta;
}

export type ApiResponse<T = unknown> =
  | ({ success: true } & ApiSuccess<T>)
  | ({ success: false } & ApiError);

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: Record<string, unknown> | FormData;
  timeout?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface UserProfile {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

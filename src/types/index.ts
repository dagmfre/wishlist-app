// filepath: src/types/index.ts
export interface WishlistItem {
  id: string;
  user_id: string;
  title: string;
  link?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface FormError {
  field: string;
  message: string;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export type AuthAction = "signin" | "signup" | "reset";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
  duration?: number;
}

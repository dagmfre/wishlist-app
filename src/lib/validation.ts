import { z } from "zod";

// Zod schemas for validation
export const WishlistItemSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters")
    .trim(),
  link: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
});

export const WishlistItemUpdateSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters")
    .trim()
    .optional(),
  link: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal(""))
    .or(z.null()),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .or(z.literal(""))
    .or(z.null()),
});

export const UserRegistrationSchema = z
  .object({
    email: z
      .string()
      .email("Please enter a valid email address")
      .min(1, "Email is required"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(
        /^(?=.*[a-z])/,
        "Password must contain at least one lowercase letter"
      )
      .regex(
        /^(?=.*[A-Z])/,
        "Password must contain at least one uppercase letter"
      )
      .regex(/^(?=.*\d)/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const UserLoginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

// Validation functions
export function validateWishlistItemData(data: unknown): {
  success: boolean;
  data?: z.infer<typeof WishlistItemSchema>;
  errors?: z.ZodError;
} {
  try {
    const validatedData = WishlistItemSchema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

export function validateWishlistItemUpdate(data: unknown): {
  success: boolean;
  data?: z.infer<typeof WishlistItemUpdateSchema>;
  errors?: z.ZodError;
} {
  try {
    const validatedData = WishlistItemUpdateSchema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

export function validateUserRegistration(data: unknown): {
  success: boolean;
  data?: z.infer<typeof UserRegistrationSchema>;
  errors?: z.ZodError;
} {
  try {
    const validatedData = UserRegistrationSchema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

export function validateUserLogin(data: unknown): {
  success: boolean;
  data?: z.infer<typeof UserLoginSchema>;
  errors?: z.ZodError;
} {
  try {
    const validatedData = UserLoginSchema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

// Helper function to format Zod errors
export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const formattedErrors: Record<string, string> = {};

  error.errors.forEach((err) => {
    const path = err.path.join(".");
    formattedErrors[path] = err.message;
  });

  return formattedErrors;
}

// Runtime type checking utilities
export function isWishlistItem(value: unknown): value is {
  id: string;
  user_id: string;
  title: string;
  link?: string;
  description?: string;
  created_at: string;
  updated_at: string;
} {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "user_id" in value &&
    "title" in value &&
    "created_at" in value &&
    "updated_at" in value &&
    typeof (value as any).id === "string" &&
    typeof (value as any).user_id === "string" &&
    typeof (value as any).title === "string" &&
    typeof (value as any).created_at === "string" &&
    typeof (value as any).updated_at === "string"
  );
}

export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function sanitizeString(str: string): string {
  return str.trim().replace(/\s+/g, " ");
}

export function normalizeUrl(url: string): string {
  if (!url) return "";

  // Add protocol if missing
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }

  return url;
}

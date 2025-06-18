"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { validateEmail, validatePassword } from "@/lib/auth";
import Link from "next/link";
import ResendVerification from "@/app/auth/ResendVerification";

export default function SignupForm() {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset states
    setErrors({});
    setSuccess(false);

    // Validate
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0];
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const result = await signUp(formData.email, formData.password);

      if (result.success) {
        setSuccess(true);
      } else {
        setErrors({ general: result.error || "Failed to create account" });
      }
    } catch (error) {
      setErrors({ general: "An unexpected error occurred" });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="card shadow-strong text-center animate-fade-in">
        <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-success-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-secondary-900 mb-4">
          Check Your Email
        </h1>
        <p className="text-secondary-600 mb-6">
          We've sent you a confirmation link at{" "}
          <strong>{formData.email}</strong>. Click the link to verify your
          account and start using your wishlist.
        </p>
        <div className="space-y-4">
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
          <ResendVerification email={formData.email} />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="card shadow-strong">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">
            Create Your Account
          </h1>
          <p className="text-secondary-600">
            Start building your wishlist today
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="alert alert-error animate-fade-in">
              {errors.general}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`input-field ${errors.email ? "input-error" : ""}`}
              placeholder="Enter your email"
              disabled={loading}
              autoComplete="email"
            />
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className={`input-field ${errors.password ? "input-error" : ""}`}
              placeholder="Create a strong password"
              disabled={loading}
              autoComplete="new-password"
            />
            {errors.password && <p className="form-error">{errors.password}</p>}
            <p className="text-xs text-secondary-500 mt-1">
              Must be at least 6 characters with uppercase, lowercase, and
              numbers
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`input-field ${
                errors.confirmPassword ? "input-error" : ""
              }`}
              placeholder="Confirm your password"
              disabled={loading}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p className="form-error">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center"
          >
            {loading && <div className="loading-spinner mr-2"></div>}
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <div className="border-t border-secondary-200 pt-4">
            <p className="text-secondary-600 text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

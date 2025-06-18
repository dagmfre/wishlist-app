"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ConfirmContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  if (error === "otp_expired" || error === "access_denied") {
    return (
      <div className="card shadow-strong text-center animate-fade-in">
        <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-warning-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-secondary-900 mb-4">
          Verification Link Expired
        </h1>
        <p className="text-secondary-600 mb-6">
          Your email verification link has expired. Please request a new
          verification email.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup" className="btn-primary">
            Sign Up Again
          </Link>
          <Link href="/login" className="btn-secondary">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

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
        Email Verified!
      </h1>
      <p className="text-secondary-600 mb-6">
        Your email has been successfully verified. You can now sign in to your
        account.
      </p>
      <Link href="/login" className="btn-primary">
        Sign In Now
      </Link>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Suspense
          fallback={
            <div className="card shadow-strong text-center">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p>Verifying your email...</p>
            </div>
          }
        >
          <ConfirmContent />
        </Suspense>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Email Confirmation - Wishlist App",
  description: "Confirm your email address",
};

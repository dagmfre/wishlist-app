import LoginForm from "@/components/LoginForm";
import { requireNoAuth } from "@/lib/auth-server";
import { Suspense } from "react";

export default async function LoginPage() {
  await requireNoAuth();

  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Suspense fallback={<div className="loading-spinner"></div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Sign In - Wishlist App",
  description: "Sign in to access your personal wishlist",
};

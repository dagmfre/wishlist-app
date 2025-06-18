import SignupForm from "@/components/SignupForm";
import { requireNoAuth } from "@/lib/auth-server";

export default async function SignupPage() {
  await requireNoAuth();

  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SignupForm />
      </div>
    </div>
  );
}

export const metadata = {
  title: "Sign Up - Wishlist App",
  description: "Create your account to start building your wishlist",
};

"use client";

import { AuthProvider } from "@/hooks/useAuth";
import WishlistPageClient from "./WishlistPageClient";
import { User } from "@/lib/supabase";

interface Props {
  initialUser: User;
}

export default function WishlistPageWrapper({ initialUser }: Props) {
  return (
    <AuthProvider>
      <WishlistPageClient initialUser={initialUser} />
    </AuthProvider>
  );
}

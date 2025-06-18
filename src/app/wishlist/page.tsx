import { requireAuth } from "@/lib/auth-server";
import WishlistPageClient from "./WishlistPageClient";

export default async function WishlistPage() {
  const user = await requireAuth();

  return (
    <WishlistPageClient
      initialUser={{ ...user, updated_at: user.updated_at || "" }}
    />
  );
}

export const metadata = {
  title: "My Wishlist - Wishlist App",
  description: "Manage and organize your personal wishlist items",
};

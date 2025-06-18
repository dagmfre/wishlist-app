import { requireAuth } from "@/lib/auth-server";
import WishlistPageClient from "./WishlistPageClient";

export default async function WishlistPage() {
  // Only do auth check on server side
  const user = await requireAuth();
  

  // Pass user data to client component
  return <WishlistPageClient initialUser={user} />;
}

export const metadata = {
  title: "My Wishlist - Wishlist App",
  description: "Manage your personal wishlist items",
};

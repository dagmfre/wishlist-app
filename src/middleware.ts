import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // Define protected routes
  const protectedRoutes = ["/wishlist"];
  const authRoutes = ["/login", "/signup"];

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect to wishlist if accessing auth routes with active session
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/wishlist", req.url));
  }

  // Handle auth callback route
  if (pathname === "/auth/callback") {
    const code = req.nextUrl.searchParams.get("code");
    const next = req.nextUrl.searchParams.get("next") || "/wishlist";

    if (code) {
      try {
        await supabase.auth.exchangeCodeForSession(code);
      } catch (error) {
        console.error("Error exchanging code for session:", error);
        return NextResponse.redirect(
          new URL("/login?error=auth_callback_error", req.url)
        );
      }
    }

    // Redirect to the intended destination or wishlist
    return NextResponse.redirect(new URL(next, req.url));
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Handle auth routes
    if (req.nextUrl.pathname.startsWith("/auth/")) {
      return res;
    }

    // Protect wishlist route
    if (req.nextUrl.pathname.startsWith("/wishlist")) {
      if (!session) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    // Redirect authenticated users away from auth pages
    if (
      (req.nextUrl.pathname === "/login" ||
        req.nextUrl.pathname === "/signup") &&
      session
    ) {
      return NextResponse.redirect(new URL("/wishlist", req.url));
    }

    return res;
  } catch (err) {
    // If there's an error with auth, allow the request to continue
    return res;
  }
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

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const error_description = requestUrl.searchParams.get("error_description");

  if (error) {
    console.error("Auth callback error:", error, error_description);
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set(
      "error",
      error_description || "Authentication failed"
    );
    return NextResponse.redirect(loginUrl);
  }

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Code exchange error:", error);
        const loginUrl = new URL("/login", requestUrl.origin);
        loginUrl.searchParams.set(
          "error",
          "Failed to verify email. Please try again."
        );
        return NextResponse.redirect(loginUrl);
      }

      // Success! Redirect to wishlist
      return NextResponse.redirect(new URL("/wishlist", requestUrl.origin));
    } catch (error) {
      console.error("Auth callback error:", error);
      const loginUrl = new URL("/login", requestUrl.origin);
      loginUrl.searchParams.set(
        "error",
        "Authentication failed. Please try again."
      );
      return NextResponse.redirect(loginUrl);
    }
  }

  // No code or error, redirect to login
  return NextResponse.redirect(new URL("/login", requestUrl.origin));
}

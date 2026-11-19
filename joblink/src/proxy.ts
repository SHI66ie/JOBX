import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Do NOT intercept Auth.js callbacks
  if (pathname.startsWith("/api/auth")) {
    return await updateSession(request);
  }

  // Only forward stray OAuth codes that are meant for the old Supabase callback
  if (
    pathname !== "/auth/callback" &&
    !pathname.startsWith("/api/auth") &&
    (searchParams.has("code") || searchParams.has("error_description"))
  ) {
    const callback = request.nextUrl.clone();
    callback.pathname = "/auth/callback";
    return NextResponse.redirect(callback);
  }

  // update user's auth session on every request
  try {
    return await updateSession(request);
  } catch (error) {
    console.error("[proxy] updateSession error:", error);
    return NextResponse.next({ request });
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

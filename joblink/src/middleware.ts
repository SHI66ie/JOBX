import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Supabase falls back to the bare Site URL when redirect_to isn't allow-listed,
  // which drops the OAuth code (or error) on the homepage. Hand it to the callback.
  const { pathname, searchParams } = request.nextUrl;
  if (pathname === "/" && (searchParams.has("code") || searchParams.has("error_description"))) {
    const callback = request.nextUrl.clone();
    callback.pathname = "/auth/callback";
    return NextResponse.redirect(callback);
  }

  // update user's auth session on every request
  return await updateSession(request);
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

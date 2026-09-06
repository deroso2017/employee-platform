import { NextRequest, NextResponse } from "next/server";
import type { Role } from "@/lib/types";

// Routes that require ADMIN role
const ADMIN_ONLY_PATHS = ["/departments"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const publicPaths = ["/login", "/register"];

  if (publicPaths.includes(pathname)) return NextResponse.next();

  const refreshCookie = request.cookies.get("refresh_token")?.value;
  if (!refreshCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role guard: redirect non-ADMIN users away from restricted paths
  if (ADMIN_ONLY_PATHS.some((p) => pathname.startsWith(p))) {
    const role = request.cookies.get("role")?.value as Role | undefined;
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};

import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const publicPaths = ["/login", "/register"];

  if (publicPaths.includes(pathname)) return NextResponse.next();

  const refreshCookie = request.cookies.get("refresh_token")?.value;
  if (!refreshCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};

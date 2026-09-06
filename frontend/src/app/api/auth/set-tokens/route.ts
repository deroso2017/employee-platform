import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import type { LoginResponse } from "@/lib/types";
import type { Role } from "@/lib/types";

interface AccessTokenPayload {
  sub: string;
  role?: Role;
  authorities?: string[];
}

/** Decode role from an access token without verifying the signature. */
function extractRole(accessToken: string): Role {
  try {
    const payload = jwtDecode<AccessTokenPayload>(accessToken);
    return payload.role ?? (payload.authorities?.[0] as Role) ?? "EMPLOYEE";
  } catch {
    return "EMPLOYEE";
  }
}

const ROLE_COOKIE = "role";

function setRoleCookie(response: NextResponse, role: Role) {
  response.cookies.set(ROLE_COOKIE, role, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

function clearRoleCookie(response: NextResponse) {
  response.cookies.delete(ROLE_COOKIE);
}

const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * CSRF protection via Origin header check.
 * Rejects requests that don't originate from our own app.
 * SameSite=strict on the cookie is the primary defense; this is defense-in-depth.
 */
function isCsrfSafe(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");

  // Server-to-server calls (e.g. SSR, curl) have no origin — allow them
  // only if there's also no referer (i.e. not a browser-initiated cross-site request)
  if (!origin && !referer) return true;

  if (origin) return origin === APP_ORIGIN;

  // Fallback: check referer starts with our origin
  return referer?.startsWith(APP_ORIGIN) ?? false;
}

export async function POST(req: NextRequest) {
  if (!isCsrfSafe(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  // If called with { action: 'refresh' }, proxy the refresh token to the backend
  if (body.action === "refresh") {
    const refreshToken = req.cookies.get("refresh_token")?.value;
    if (!refreshToken)
      return NextResponse.json({ error: "No refresh token" }, { status: 401 });

    const backendRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      },
    );

    if (!backendRes.ok)
      return NextResponse.json(
        { error: "Refresh failed" },
        { status: backendRes.status },
      );

    const data: LoginResponse = await backendRes.json();
    const response = NextResponse.json(data);
    response.cookies.set("refresh_token", data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    setRoleCookie(response, extractRole(data.accessToken));
    return response;
  }

  const { refreshToken, accessToken } = body;

  const response = NextResponse.json({ ok: true });

  response.cookies.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  if (accessToken) {
    setRoleCookie(response, extractRole(accessToken));
  }

  return response;
}

export async function DELETE(req: NextRequest) {
  if (!isCsrfSafe(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const refreshToken = req.cookies.get("refresh_token")?.value;

  if (refreshToken) {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.get("Authorization") ?? "",
      },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {});
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete("refresh_token");
  clearRoleCookie(response);
  return response;
}

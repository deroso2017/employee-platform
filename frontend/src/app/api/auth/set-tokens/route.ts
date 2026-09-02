import { NextRequest, NextResponse } from "next/server";
import type { LoginResponse } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // If called with { action: 'refresh' }, proxy the refresh token to the backend
  if (body.action === "refresh") {
    const refreshToken = req.cookies.get("refresh_token")?.value;
    if (!refreshToken) return NextResponse.json({ error: "No refresh token" }, { status: 401 });

    const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!backendRes.ok) return NextResponse.json({ error: "Refresh failed" }, { status: backendRes.status });

    const data: LoginResponse = await backendRes.json();
    const response = NextResponse.json(data);
    response.cookies.set("refresh_token", data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return response;
  }

  const { refreshToken } = body;

  const response = NextResponse.json({ ok: true });

  response.cookies.set("refresh_token", refreshToken, {
    httpOnly: true, // JS cannot read this
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "strict", // no cross-site requests
    maxAge: 60 * 60 * 24 * 30, // 30 days in seconds
    path: "/",
  });

  return response;
}

export async function DELETE(req: NextRequest) {
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
  return response;
}

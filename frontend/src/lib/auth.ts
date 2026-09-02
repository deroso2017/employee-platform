import { jwtDecode } from "jwt-decode";
import type { Role, User } from "./types";

interface JwtPayload {
  sub: string;
  role?: Role;
  authorities?: string[];
  exp: number;
}

// In-memory only — never touches localStorage or document.cookie
let accessToken: string | null = null;

export function setAccessToken(token: string) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
}

// Refresh token is set server-side via /api/auth/set-tokens
// This client function just calls the route handler
export async function persistRefreshToken(refreshToken: string) {
  await fetch("/api/auth/set-tokens", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
}

export async function clearRefreshToken() {
  await fetch("/api/auth/set-tokens", { method: "DELETE" });
}

export function getCurrentUser(): User | null {
  if (!accessToken) return null;
  try {
    const payload = jwtDecode<JwtPayload>(accessToken);
    if (payload.exp * 1000 < Date.now()) return null; // expired
    const role =
      payload.role ?? (payload.authorities?.[0] as Role) ?? "EMPLOYEE";
    return { id: 0, email: payload.sub, role };
  } catch {
    return null;
  }
}

export function isAccessTokenExpired(): boolean {
  if (!accessToken) return true;
  try {
    const { exp } = jwtDecode<JwtPayload>(accessToken);
    return exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

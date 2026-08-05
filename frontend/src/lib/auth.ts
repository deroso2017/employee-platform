import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { Role, User } from "./types";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

interface JwtPayload {
  sub: string;
  role?: Role;
  authorities?: string[];
  exp: number;
}

export function setTokens(accessToken: string, refreshToken: string) {
  Cookies.set(ACCESS_TOKEN_KEY, accessToken, { expires: 1 });
  Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { expires: 7 });
}

export function getAccessToken() {
  return Cookies.get(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return Cookies.get(REFRESH_TOKEN_KEY);
}

export function clearTokens() {
  Cookies.remove(ACCESS_TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
}

export function getCurrentUser(): User | null {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const payload = jwtDecode<JwtPayload>(token);
    const role =
      payload.role ??
      (payload.authorities?.[0] as Role) ??
      "EMPLOYEE";
    return { id: 0, email: payload.sub, role };
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return !!getAccessToken();
}

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  setAccessToken,
  clearAccessToken,
  persistRefreshToken,
  getCurrentUser,
} from "@/lib/auth";
import { authApi } from "@/lib/api";
import type { User } from "@/lib/types";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // On mount: try to restore session by silently refreshing via httpOnly cookie
  useEffect(() => {
    (async () => {
      try {
        // The httpOnly cookie is sent automatically by the browser
        const data = await authApi.refreshToken();
        setAccessToken(data.accessToken);
        await persistRefreshToken(data.refreshToken);
        setUser(getCurrentUser());
      } catch {
        // No valid session — user needs to log in
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const handler = () => {
      if (loading) return;
      setUser(null);
      router.push("/login");
    };
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
  }, [router, loading]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await authApi.login(email, password);
      setAccessToken(data.accessToken);
      await persistRefreshToken(data.refreshToken);
      setUser(getCurrentUser());
      router.push("/dashboard");
    },
    [router],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* best-effort */
    }
    clearAccessToken();
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

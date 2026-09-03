import axios from "axios";
import {
  clearAccessToken,
  getAccessToken,
  isAccessTokenExpired,
  setAccessToken,
} from "./auth";
import type { Department, Employee, LoginResponse, Page, User } from "./types";

const api = axios.create({
  baseURL: "",
});

let refreshPromise: Promise<string> | null = null;

function doRefresh(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = fetch("/api/auth/set-tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "refresh" }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Refresh failed");
        return res.json() as Promise<LoginResponse>;
      })
      .then((data) => {
        setAccessToken(data.accessToken);
        return data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// Proactively refresh if the access token is expired before sending the request,
// instead of waiting for a 401 to come back from the server.
// Skip public auth endpoints — they don't need a token and have no session to refresh.
const PUBLIC_PATHS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
];

api.interceptors.request.use(async (config) => {
  const url = config.url ?? "";
  if (PUBLIC_PATHS.some((path) => url.includes(path))) {
    return config;
  }

  if (isAccessTokenExpired()) {
    try {
      const newToken = await doRefresh();
      config.headers.Authorization = `Bearer ${newToken}`;
    } catch {
      // Refresh token is also invalid/expired — session is dead.
      // Notify AuthContext to clear state and redirect to /login.
      clearAccessToken();
      window.dispatchEvent(new Event("auth:logout"));
      return Promise.reject(new Error("Session expired"));
    }
  } else {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Reactive fallback: handles 401s that slip through (e.g. server-side
// invalidation, clock skew) — reuses the same refreshPromise to avoid
// duplicate refresh calls during concurrent requests.
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const newToken = await doRefresh();
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        // Both the original request and the refresh attempt failed —
        // session is unrecoverable, redirect to /login.
        clearAccessToken();
        window.dispatchEvent(new Event("auth:logout"));
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>("/api/auth/login", { email, password }),
  logout: () => fetch("/api/auth/set-tokens", { method: "DELETE" }),
  profile: () => api.get<User>("/api/auth/profile"),
  refreshToken: () =>
    fetch("/api/auth/set-tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "refresh" }),
    }).then((res) => {
      if (!res.ok) throw new Error("Refresh failed");
      return res.json() as Promise<LoginResponse>;
    }),
  register: (email: string, password: string) =>
    api.post("/api/auth/register", { email, password }),
};

// Employees
export const employeeApi = {
  getAll: (page = 0, size = 10) =>
    api.get<Page<Employee>>(`/api/employees?page=${page}&size=${size}`),
  getById: (id: number) => api.get<Employee>(`/api/employees/${id}`),
  search: (name: string, page = 0) =>
    api.get<Page<Employee>>(`/api/employees/search?name=${name}&page=${page}`),
  create: (data: { firstName: string; lastName: string; email: string }) =>
    api.post<Employee>("/api/employees", data),
  update: (
    id: number,
    data: { firstName: string; lastName: string; email: string },
  ) => api.put<Employee>(`/api/employees/${id}`, data),
  delete: (id: number) => api.delete(`/api/employees/${id}`),
  assignDepartment: (employeeId: number, departmentId: number) =>
    api.put<Employee>(
      `/api/employees/${employeeId}/department/${departmentId}`,
    ),
};

// Departments
export const departmentApi = {
  getAll: () => api.get<Department[]>("/api/departments"),
  create: (name: string) => api.post<Department>("/api/departments", { name }),
  update: (id: number, name: string) =>
    api.put<Department>(`/api/departments/${id}`, { name }),
  delete: (id: number) => api.delete(`/api/departments/${id}`),
};

export default api;

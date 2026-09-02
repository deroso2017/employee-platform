import axios from "axios";
import { getAccessToken, setAccessToken } from "./auth";
import type { Department, Employee, LoginResponse, Page, User } from "./types";

const api = axios.create({
  baseURL: "",
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise: Promise<string> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

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
      try {
        const newToken = await refreshPromise;
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
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
  register: (email: string, password: string, role: string) =>
    api.post("/api/auth/register", { email, password, role }),
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

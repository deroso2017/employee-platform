import axios from "axios";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./auth";
import type { Department, Employee, LoginResponse, Page, User } from "./types";

const api = axios.create({
  baseURL: "",
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const { data } = await axios.post<LoginResponse>(
            "/api/auth/refresh",
            { refreshToken }
          );
          setTokens(data.accessToken, data.refreshToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch {
          clearTokens();
          window.location.href = "/login";
        }
      } else {
        clearTokens();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  register: (email: string, password: string, role: string) =>
    api.post("/api/auth/register", { email, password, role }),
  login: (email: string, password: string) =>
    api.post<LoginResponse>("/api/auth/login", { email, password }),
  logout: (refreshToken: string) =>
    api.post("/api/auth/logout", { refreshToken }),
  profile: () => api.get<User>("/api/auth/profile"),
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
  update: (id: number, data: { firstName: string; lastName: string; email: string }) =>
    api.put<Employee>(`/api/employees/${id}`, data),
  delete: (id: number) => api.delete(`/api/employees/${id}`),
  assignDepartment: (employeeId: number, departmentId: number) =>
    api.put<Employee>(`/api/employees/${employeeId}/department/${departmentId}`),
};

// Departments
export const departmentApi = {
  create: (name: string) =>
    api.post<Department>("/api/departments", { name }),
};

export default api;

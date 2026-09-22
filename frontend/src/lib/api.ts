import axios from "axios";
import {
  clearAccessToken,
  getAccessToken,
  isAccessTokenExpired,
  setAccessToken,
} from "./auth";
import type {
  Department,
  Employee,
  LoginResponse,
  Page,
  Project,
  Task,
  TaskStatus,
  TaskPriority,
  Team,
  User,
  DashboardResponse,
  Role,
} from "./types";
import { useAuth } from "@/context/AuthContext";

const api = axios.create({
  baseURL: "",
  timeout: 10000, // 10 seconds timeout prevents requests from hanging forever after standby
  withCredentials: true,
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
    const { authInitialized } = useAuth();
    try {
      const newToken = await doRefresh();
      config.headers.Authorization = `Bearer ${newToken}`;
    } catch {
      // Only treat this as a dead session if auth has already initialized.
      // During startup, the token is simply not loaded yet — not expired.
      if (authInitialized) {
        clearAccessToken();
        window.dispatchEvent(new Event("auth:logout"));
        return Promise.reject(new Error("Session expired"));
      }
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
    api.get<Page<Employee>>("/api/employees/search", {
      params: {
        name,
        page,
      },
    }),
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
  linkUser: (employeeId: number, userId: number) =>
    api.put<Employee>(`/api/employees/${employeeId}/account/${userId}`),
  uploadProfileImage: (employeeId: number, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post<Employee>(
      `/api/employees/${employeeId}/profile-image`,
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
  },
  profileImageUrl: (employeeId: number) =>
    `/api/employees/${employeeId}/profile-image`,
};

// Users
export const userApi = {
  getAll: (page = 0, size = 10) =>
    api.get<Page<User>>(`/api/users?page=${page}&size=${size}`),
  getById: (id: number) => api.get<User>(`/api/users/${id}`),
  search: (name: string, page = 0) =>
    api.get<Page<User>>("/api/users/search", {
      params: {
        name,
        page,
      },
    }),
  update: (
    id: number,
    data: { email: string; password: string; role: string },
  ) => api.put<User>(`/api/users/${id}`, data),
  changeRole: (id: number, role: Role) =>
    api.patch(`/api/users/${id}/role`, { role }),
  getLinkable: (page = 0, size = 100) =>
    api.get<Page<User>>("/api/users/linkable", {
      params: {
        page,
        size,
      },
    }),
  delete: (id: number) => api.delete(`/api/users/${id}`),
};

// Departments
export const departmentApi = {
  getAll: () => api.get<Department[]>("/api/departments"),
  create: (name: string) => api.post<Department>("/api/departments", { name }),
  update: (id: number, name: string) =>
    api.put<Department>(`/api/departments/${id}`, { name }),
  delete: (id: number) => api.delete(`/api/departments/${id}`),
};

// Teams
export const teamApi = {
  getAll: () => api.get<Team[]>("/api/teams"),

  getById: (id: number) => api.get<Team>(`/api/teams/${id}`),

  create: (data: { name: string }) => api.post<Team>("/api/teams", data),

  update: (id: number, data: { name: string }) =>
    api.patch<Team>(`/api/teams/${id}`, data),

  delete: (id: number) => api.delete(`/api/teams/${id}`),

  getMembers: (teamId: number) =>
    api.get<Employee[]>(`/api/teams/${teamId}/members`),

  addMember: (teamId: number, employeeId: number) =>
    api.post<Employee>(`/api/teams/${teamId}/members/${employeeId}`),

  removeMember: (teamId: number, employeeId: number) =>
    api.delete(`/api/teams/${teamId}/members/${employeeId}`),
};

// Projects
export const projectApi = {
  getAll: () => api.get<Project[]>("/api/projects"),

  getById: (id: number) => api.get<Project>(`/api/projects/${id}`),

  create: (data: {
    name: string;
    description?: string;
    status?: string;
    teamId: number;
  }) => api.post<Project>("/api/projects", data),

  update: (
    id: number,
    data: {
      name: string;
      description?: string;
      status?: string;
      teamId: number;
    },
  ) => api.patch<Project>(`/api/projects/${id}`, data),

  delete: (id: number) => api.delete(`/api/projects/${id}`),
};

// Tasks
export const taskApi = {
  getByProject: (projectId: number) =>
    api.get<Task[]>(`/api/projects/${projectId}/tasks`),

  getById: (id: number) => api.get<Task>(`/api/tasks/${id}`),

  create: (
    projectId: number,
    data: {
      title: string;
      description?: string;
      status: TaskStatus;
      priority: TaskPriority;
      assigneeId: number | null;
    },
  ) => api.post<Task>(`/api/projects/${projectId}/tasks`, data),

  update: (
    id: number,
    data: {
      title: string;
      description?: string;
      status: TaskStatus;
      priority: TaskPriority;
      assigneeId: number | null;
    },
  ) => api.patch<Task>(`/api/tasks/${id}`, data),

  delete: (id: number) => api.delete(`/api/tasks/${id}`),
};

// Dashboard
export const dashboardApi = {
  get: () => api.get<DashboardResponse>("/api/dashboard"),
};

export default api;

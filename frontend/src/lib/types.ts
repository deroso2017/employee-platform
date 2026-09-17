export type Role = "ADMIN" | "MANAGER" | "EMPLOYEE" | "USER";

export interface User {
  id: number;
  email: string;
  password?: string;
  role: Role;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileImage?: string | null;
  department?: Department;
}

export interface Department {
  id: number;
  name: string;
}

export interface Team {
  id: number;
  name: string;
  memberCount: number;
}

export type ProjectStatus = "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface Project {
  id: number;
  name: string;
  description: string | null;
  status: ProjectStatus;
  teamId: number;
  teamName: string;
  managerId: number;
  managerName: string;
}

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: number;
  projectName: string;
  assigneeId: number | null;
  assigneeName: string | null;
}

export interface DashboardOverview {
  employees: number;
  departments: number;
  teams: number;
  projects: number;
  tasks: number;
}

export interface DashboardProjectOverview {
  byStatus: Record<ProjectStatus, number>;
}

export interface DashboardTaskOverview {
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
}

export interface DashboardResponse {
  overview: DashboardOverview;
  projects: DashboardProjectOverview;
  tasks: DashboardTaskOverview;
  recentProjects: Project[];
  myTasks: Task[];
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

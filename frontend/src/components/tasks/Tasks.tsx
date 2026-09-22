"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Pencil, Search, Trash2 } from "lucide-react";

import { projectApi, taskApi } from "@/lib/api";
import type { Project, Task, TaskPriority, TaskStatus } from "@/lib/types";

import { useAuth } from "@/context/AuthContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/toast";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";

interface TasksProps {
  createOpen: boolean;
  onCreateOpenChange: (open: boolean) => void;
}

export function Tasks({ createOpen, onCreateOpenChange }: TasksProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);

  const { data: projects = [], isLoading: projectsLoading } = useQuery<
    Project[]
  >({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await projectApi.getAll();
      return response.data;
    },
  });

  // Track user-selected project override, or default to the last project index when projects load
  const [manualProjectId, setManualProjectId] = useState<number | null>(null);

  const activeProjectId =
    manualProjectId !== null
      ? manualProjectId
      : projects.length > 0
        ? projects[projects.length - 1].id
        : null;

  const selectedProject =
    projects.find((project) => project.id === activeProjectId) ?? null;

  const {
    data: tasks = [],
    isLoading: tasksLoading,
    isFetching: tasksFetching,
  } = useQuery<Task[]>({
    queryKey: ["project-tasks", activeProjectId],
    queryFn: async () => {
      if (activeProjectId === null) {
        return [];
      }

      const response = await taskApi.getByProject(activeProjectId);

      return response.data;
    },
    enabled: activeProjectId !== null,
  });

  const deleteMutation = useMutation({
    mutationFn: (taskId: number) => taskApi.delete(taskId),

    onSuccess: () => {
      if (activeProjectId !== null) {
        queryClient.invalidateQueries({
          queryKey: ["project-tasks", activeProjectId],
        });
      }

      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });

      toast.add({
        title: "Task deleted",
        description: "The task was deleted successfully.",
        type: "success",
      });

      setDeleteTask(null);
    },

    onError: () => {
      toast.add({
        title: "Delete failed",
        description: "The task could not be deleted.",
        type: "error",
      });
    },
  });

  const role = user?.role;

  const canCreateOrUpdate = role === "MANAGER" || role === "ADMIN";

  const canDelete = role === "MANAGER" || role === "ADMIN";

  const normalizedSearch = search.trim().toLowerCase();

  const filteredTasks = tasks.filter((task) => {
    if (!normalizedSearch) {
      return true;
    }

    return (
      task.title.toLowerCase().includes(normalizedSearch) ||
      task.description?.toLowerCase().includes(normalizedSearch) ||
      task.assigneeName?.toLowerCase().includes(normalizedSearch)
    );
  });

  function openEdit(task: Task) {
    setEditingTask(task);
    onCreateOpenChange(true);
  }

  function handleFormOpenChange(open: boolean) {
    onCreateOpenChange(open);

    if (!open) {
      setEditingTask(null);
    }
  }

  if (projectsLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-border bg-card shadow-sm">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="w-full lg:max-w-sm">
            <label
              htmlFor="task-project"
              className="mb-2 block text-sm font-medium"
            >
              Project
            </label>

            <Select
              value={activeProjectId ? String(activeProjectId) : ""}
              onValueChange={(value) => {
                setManualProjectId(value ? Number(value) : null);
                setSearch("");
              }}
            >
              <SelectTrigger id="task-project" className="w-full">
                <SelectValue>
                  {selectedProject ? selectedProject.name : "Select a project"}
                </SelectValue>
              </SelectTrigger>

              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={String(project.id)}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full lg:flex-1">
            <label
              htmlFor="task-search"
              className="mb-2 block text-sm font-medium"
            >
              Search
            </label>

            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />

              <Input
                id="task-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tasks, descriptions or assignees..."
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Project context */}
      {selectedProject && (
        <div className="flex flex-col gap-1 rounded-xl border border-border bg-card px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {selectedProject.name}
            </p>

            <p className="text-xs text-muted-foreground">
              {filteredTasks.length}{" "}
              {filteredTasks.length === 1 ? "task" : "tasks"}
              {search.trim() ? " matching your search" : ""}
            </p>
          </div>

          {tasksFetching && !tasksLoading && (
            <span className="text-xs text-muted-foreground">Updating...</span>
          )}
        </div>
      )}

      {/* Content */}
      {!selectedProject ? (
        <EmptyState message="No projects available." />
      ) : tasksLoading ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-border bg-card shadow-sm">
          <Spinner />
        </div>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          message={
            search.trim()
              ? "No tasks match your search."
              : "This project has no tasks yet."
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="min-w-[280px]">Task</TableHead>

                  <TableHead>Status</TableHead>

                  <TableHead>Priority</TableHead>

                  <TableHead>Assignee</TableHead>

                  {canCreateOrUpdate && (
                    <TableHead className="w-[70px] text-right">
                      Actions
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <div className="min-w-0 space-y-1">
                        <div className="font-medium text-foreground">
                          {task.title}
                        </div>

                        {task.description && (
                          <div className="max-w-[520px] truncate text-xs text-muted-foreground">
                            {task.description}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={task.status} />
                    </TableCell>

                    <TableCell>
                      <PriorityBadge priority={task.priority} />
                    </TableCell>

                    <TableCell>
                      {task.assigneeName ? (
                        <span className="text-sm">{task.assigneeName}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Unassigned
                        </span>
                      )}
                    </TableCell>

                    {canCreateOrUpdate && (
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            aria-label={`Actions for ${task.title}`}
                          >
                            <MoreHorizontal
                              className="size-4"
                              aria-hidden="true"
                            />
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(task)}>
                              <Pencil
                                className="mr-2 size-4"
                                aria-hidden="true"
                              />
                              Edit
                            </DropdownMenuItem>

                            {canDelete && (
                              <>
                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => setDeleteTask(task)}
                                >
                                  <Trash2
                                    className="mr-2 size-4"
                                    aria-hidden="true"
                                  />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Create / Edit dialog */}
      {selectedProject && (
        <TaskFormDialog
          key={
            editingTask
              ? `edit-${editingTask.id}`
              : `create-${selectedProject.id}`
          }
          open={createOpen}
          onOpenChange={handleFormOpenChange}
          project={selectedProject}
          task={editingTask}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteTask !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTask(null);
          }
        }}
        title="Delete task?"
        description={
          deleteTask
            ? `Are you sure you want to delete "${deleteTask.title}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTask) {
            deleteMutation.mutate(deleteTask.id);
          }
        }}
      />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 shadow-sm">
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">{message}</p>

        <p className="mt-1 text-xs text-muted-foreground">
          {message === "No projects available."
            ? "Create a project first to start managing tasks."
            : "Try adjusting your search or create a new task."}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: TaskStatus }) {
  const config: Record<TaskStatus, { label: string; className: string }> = {
    TODO: {
      label: "To Do",
      className: "bg-muted text-muted-foreground",
    },
    IN_PROGRESS: {
      label: "In Progress",
      className: "bg-info/10 text-info",
    },
    DONE: {
      label: "Done",
      className: "bg-success/10 text-success",
    },
    CANCELLED: {
      label: "Cancelled",
      className: "bg-destructive/10 text-destructive",
    },
  };

  const item = config[status];

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${item.className}`}
    >
      {item.label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const config: Record<TaskPriority, { label: string; className: string }> = {
    LOW: {
      label: "Low",
      className: "bg-muted text-muted-foreground",
    },
    MEDIUM: {
      label: "Medium",
      className: "bg-info/10 text-info",
    },
    HIGH: {
      label: "High",
      className: "bg-warning/10 text-warning",
    },
    URGENT: {
      label: "Urgent",
      className: "bg-destructive/10 text-destructive",
    },
  };

  const item = config[priority];

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${item.className}`}
    >
      {item.label}
    </span>
  );
}

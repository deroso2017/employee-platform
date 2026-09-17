"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { projectApi, taskApi } from "@/lib/api";
import type { Project, Task, TaskPriority, TaskStatus } from "@/lib/types";

import { useAuth } from "@/context/AuthContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";
import { Spinner } from "@/components/ui/spinner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import Navbar from "@/components/layout/Navbar";

export default function TasksPage() {
  const { user } = useAuth();

  const queryClient = useQueryClient();

  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null,
  );

  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
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

  const activeProjectId = selectedProjectId ?? projects[0]?.id ?? null;

  const selectedProject =
    projects.find((project) => project.id === activeProjectId) ?? null;

  const {
    data: tasks = [],
    isLoading: tasksLoading,
    isFetching: tasksFetching,
  } = useQuery<Task[]>({
    queryKey: ["project-tasks", activeProjectId],
    queryFn: async () => {
      if (!activeProjectId) {
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
      if (activeProjectId) {
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

  function openCreate() {
    setEditingTask(null);
    setFormOpen(true);
  }

  function openEdit(task: Task) {
    setEditingTask(task);
    setFormOpen(true);
  }

  if (projectsLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>

            <p className="text-sm text-muted-foreground">
              Manage tasks assigned to project teams.
            </p>
          </div>

          {canCreateOrUpdate && selectedProject && (
            <Button onClick={openCreate}>Add Task</Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-[280px_1fr]">
          <div className="space-y-2">
            <label htmlFor="project" className="text-sm font-medium">
              Project
            </label>

            <select
              id="project"
              value={activeProjectId ?? ""}
              onChange={(event) => {
                const value = event.target.value;

                setSelectedProjectId(value ? Number(value) : null);
              }}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="task-search" className="text-sm font-medium">
              Search
            </label>

            <Input
              id="task-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tasks, descriptions or assignees..."
            />
          </div>
        </div>

        {!selectedProject ? (
          <EmptyState message="No projects available." />
        ) : tasksLoading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <Spinner />
          </div>
        ) : filteredTasks.length === 0 ? (
          <EmptyState
            message={
              search
                ? "No tasks match your search."
                : "This project has no tasks yet."
            }
          />
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assignee</TableHead>
                  {canCreateOrUpdate && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{task.title}</div>

                        {task.description && (
                          <div className="max-w-[500px] truncate text-xs text-muted-foreground">
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
                      {task.assigneeName ?? (
                        <span className="text-muted-foreground">
                          Unassigned
                        </span>
                      )}
                    </TableCell>

                    {canCreateOrUpdate && (
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEdit(task)}
                          >
                            Edit
                          </Button>

                          {canDelete && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeleteTask(task)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {tasksFetching && !tasksLoading && (
          <div className="text-xs text-muted-foreground">Updating tasks...</div>
        )}

        {selectedProject && formOpen && (
          <TaskFormDialog
            key={
              editingTask
                ? `edit-${editingTask.id}`
                : `create-${selectedProject.id}`
            }
            open={formOpen}
            onOpenChange={setFormOpen}
            project={selectedProject}
            task={editingTask}
          />
        )}

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
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-dashed">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: TaskStatus }) {
  const labels: Record<TaskStatus, string> = {
    TODO: "To Do",
    IN_PROGRESS: "In Progress",
    DONE: "Done",
    CANCELLED: "Cancelled",
  };

  return (
    <span className="inline-flex rounded-full border px-2.5 py-1 text-xs font-medium">
      {labels[status]}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span className="inline-flex rounded-full border px-2.5 py-1 text-xs font-medium">
      {priority.charAt(0) + priority.slice(1).toLowerCase()}
    </span>
  );
}

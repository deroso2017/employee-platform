"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FolderKanban,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { projectApi } from "@/lib/api";
import type { Project, ProjectStatus } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";

import ProjectFormDialog from "@/components/projects/ProjectFormDialog";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";

import { extractErrorMessage } from "@/lib/errors";

const STATUS_LABELS: Record<ProjectStatus, string> = {
  PLANNED: "Planned",
  ACTIVE: "Active",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

interface StatusBadgeProps {
  status: ProjectStatus;
}

function StatusBadge({ status }: StatusBadgeProps) {
  const className: Record<ProjectStatus, string> = {
    PLANNED: "bg-muted text-muted-foreground",
    ACTIVE: "bg-success/10 text-success",
    COMPLETED: "bg-info/10 text-info",
    CANCELLED: "bg-destructive/10 text-destructive",
  };

  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-1",
        "text-xs font-medium",
        className[status],
      ].join(" ")}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function Projects() {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const canCreate = user?.role === "MANAGER";
  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";

  const {
    data: projects = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["projects"],
    enabled: !loading,
    queryFn: async () => {
      const response = await projectApi.getAll();
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => projectApi.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });

      setDeleteDialogOpen(false);
      setProjectToDelete(null);

      toast.add({
        title: "Project deleted",
        type: "success",
      });
    },

    onError: (error) => {
      toast.add({
        title: "Failed to delete project",
        description: extractErrorMessage(error),
        type: "error",
      });
    },
  });

  function openCreate() {
    setEditingProject(null);
    setFormDialogOpen(true);
  }

  function openEdit(project: Project) {
    setEditingProject(project);
    setFormDialogOpen(true);
  }

  function openDelete(project: Project) {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  }

  function confirmDelete() {
    if (!projectToDelete) {
      return;
    }

    deleteMutation.mutate(projectToDelete.id);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-xl border border-border bg-card">
        <Spinner className="size-7" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
        <FolderKanban className="mx-auto h-10 w-10 text-destructive" />

        <h3 className="mt-4 font-semibold text-foreground">
          Unable to load projects
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Something went wrong while loading the projects.
        </p>
      </div>
    );
  }

  return (
    <>
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="font-semibold text-foreground">Project overview</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {projects.length === 0
                ? "No projects have been created yet."
                : `${projects.length} ${
                    projects.length === 1 ? "project" : "projects"
                  }`}
            </p>
          </div>

          {canCreate && (
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add project
            </Button>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <FolderKanban className="h-7 w-7 text-primary" />
            </div>

            <h3 className="mt-5 text-base font-semibold text-foreground">
              No projects yet
            </h3>

            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Create your first project to start organizing work across your
              teams.
            </p>

            {canCreate && (
              <Button className="mt-5" onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Create project
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="min-w-64 pl-6">Project</TableHead>

                  <TableHead>Team</TableHead>

                  <TableHead>Manager</TableHead>

                  <TableHead>Status</TableHead>

                  {canManage && (
                    <TableHead className="w-16 pr-6 text-right">
                      Actions
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>

              <TableBody>
                {projects.map((project) => (
                  <TableRow
                    key={project.id}
                    className="group transition-colors"
                  >
                    <TableCell className="pl-6">
                      <div className="min-w-0">
                        <div className="font-medium text-foreground">
                          {project.name}
                        </div>

                        {project.description && (
                          <p className="mt-1 max-w-md truncate text-sm text-muted-foreground">
                            {project.description}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm text-foreground">
                        {project.teamName}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm text-foreground">
                        {project.managerName}
                      </span>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={project.status} />
                    </TableCell>

                    {canManage && (
                      <TableCell className="pr-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            aria-label={`Actions for ${project.name}`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(project)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => openDelete(project)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <ProjectFormDialog
        key={editingProject?.id ?? "create"}
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        project={editingProject}
        onSaved={() => {
          queryClient.invalidateQueries({
            queryKey: ["projects"],
          });
        }}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete project?"
        description={
          projectToDelete
            ? `Are you sure you want to delete ${projectToDelete.name}? This action cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleteMutation.isPending}
        onConfirm={confirmDelete}
      />
    </>
  );
}

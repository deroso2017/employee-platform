"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderKanban, Plus } from "lucide-react";

import { projectApi } from "@/lib/api";
import type { Project, ProjectStatus } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import ProjectFormDialog from "@/components/projects/ProjectFormDialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { extractErrorMessage } from "@/lib/errors";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const STATUS_LABELS: Record<ProjectStatus, string> = {
  PLANNED: "Planned",
  ACTIVE: "Active",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export default function ProjectsPage() {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();

  const [formDialogOpen, setFormDialogOpen] = useState(false);

  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const canCreate = user?.role === "MANAGER";

  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";

  const { data: projects = [], isLoading } = useQuery({
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

  function getStatusClass(status: ProjectStatus) {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";

      case "COMPLETED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";

      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";

      case "PLANNED":
      default:
        return "bg-muted text-muted-foreground";
    }
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Projects</h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage company projects and their teams.
            </p>
          </div>

          {canCreate && (
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Project
            </Button>
          )}
        </div>

        <div className="rounded-lg border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Status</TableHead>

                {canManage && <TableHead className="w-36">Actions</TableHead>}
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={canManage ? 5 : 4} className="py-8">
                    <div className="flex justify-center">
                      <Spinner className="size-7" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canManage ? 5 : 4} className="py-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <FolderKanban className="h-6 w-6 text-muted-foreground" />
                      </div>

                      <h3 className="font-medium">No projects found</h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        There are currently no projects to display.
                      </p>

                      {canCreate && (
                        <Button className="mt-4" onClick={openCreate}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Project
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{project.name}</div>

                        {project.description && (
                          <div className="mt-1 max-w-md truncate text-sm text-muted-foreground">
                            {project.description}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>{project.teamName}</TableCell>

                    <TableCell>{project.managerName}</TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                          project.status,
                        )}`}
                      >
                        {STATUS_LABELS[project.status]}
                      </span>
                    </TableCell>

                    {canManage && (
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEdit(project)}
                          >
                            Edit
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openDelete(project)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>

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
    </div>
  );
}

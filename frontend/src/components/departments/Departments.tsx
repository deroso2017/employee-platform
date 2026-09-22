"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Check, Pencil, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";

import { useAuth } from "@/context/AuthContext";
import { departmentApi } from "@/lib/api";
import { extractErrorMessage } from "@/lib/errors";
import type { Department } from "@/lib/types";

export function Departments() {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] =
    useState<Department | null>(null);

  const canCreate = user?.role === "ADMIN";
  const canEdit = user?.role === "ADMIN";
  const canDelete = user?.role === "ADMIN";

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ["departments"],
    enabled: !loading,
    queryFn: async () => {
      const response = await departmentApi.getAll();
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (newName: string) => departmentApi.create(newName),

    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: ["departments"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });

      setName("");

      toast.add({
        title: "Department created",
        description: `"${response.data.name}" was added successfully.`,
        type: "success",
      });
    },

    onError: (error) => {
      toast.add({
        title: "Unable to create department",
        description: extractErrorMessage(error, "Failed to create department."),
        type: "error",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, newName }: { id: number; newName: string }) =>
      departmentApi.update(id, newName),

    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: ["departments"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });

      setEditingId(null);
      setEditName("");

      toast.add({
        title: "Department updated",
        description: `"${response.data.name}" was saved successfully.`,
        type: "success",
      });
    },

    onError: (error) => {
      toast.add({
        title: "Unable to update department",
        description: extractErrorMessage(error, "Failed to update department."),
        type: "error",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => departmentApi.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["departments"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });

      setDeleteDialogOpen(false);
      setDepartmentToDelete(null);

      toast.add({
        title: "Department deleted",
        type: "success",
      });
    },

    onError: (error) => {
      toast.add({
        title: "Unable to delete department",
        description: extractErrorMessage(error, "Failed to delete department."),
        type: "error",
      });
    },
  });

  function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    createMutation.mutate(trimmedName);
  }

  function startEdit(department: Department) {
    setEditingId(department.id);
    setEditName(department.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
  }

  function saveEdit(departmentId: number) {
    const trimmedName = editName.trim();

    if (!trimmedName) {
      return;
    }

    updateMutation.mutate({
      id: departmentId,
      newName: trimmedName,
    });
  }

  function handleDelete(department: Department) {
    setDepartmentToDelete(department);
    setDeleteDialogOpen(true);
  }

  function confirmDelete() {
    if (!departmentToDelete) {
      return;
    }

    deleteMutation.mutate(departmentToDelete.id);
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* Create department */}
        {canCreate && (
          <Card className="h-fit rounded-xl border-border shadow-sm">
            <CardContent className="p-5">
              <div className="mb-5 flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Building2 className="size-5" />
                </div>

                <div className="min-w-0">
                  <h2 className="font-semibold">New department</h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Add a department to your organization.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreate} className="space-y-3">
                <Input
                  id="department-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Engineering"
                  disabled={createMutation.isPending}
                  maxLength={100}
                />

                <Button
                  type="submit"
                  disabled={!name.trim() || createMutation.isPending}
                  className="w-full"
                >
                  {createMutation.isPending ? (
                    <>
                      <Spinner className="size-4" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="size-4" />
                      Create department
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Department list */}
        <section className="min-w-0">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">All departments</h2>
              <p className="text-sm text-muted-foreground">
                {departments.length}{" "}
                {departments.length === 1 ? "department" : "departments"}
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card
                  key={index}
                  className="rounded-xl border-border shadow-sm"
                >
                  <CardContent className="p-5">
                    <div className="flex animate-pulse items-center gap-3">
                      <div className="size-10 rounded-lg bg-muted" />

                      <div className="flex-1">
                        <div className="h-4 w-32 rounded bg-muted" />
                        <div className="mt-2 h-3 w-20 rounded bg-muted" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : departments.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 text-center">
              <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
                <Building2 className="size-6 text-muted-foreground" />
              </div>

              <h3 className="font-medium">No departments yet</h3>

              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {canCreate
                  ? "Create your first department to get started."
                  : "There are currently no departments available."}
              </p>

              {canCreate && (
                <Button
                  className="mt-5"
                  variant="outline"
                  onClick={() => {
                    document.getElementById("department-name")?.focus();
                  }}
                >
                  <Plus className="size-4" />
                  Add department
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {departments.map((department) => {
                const isEditing = editingId === department.id;

                return (
                  <Card
                    key={department.id}
                    className="rounded-xl border-border shadow-sm transition-shadow hover:shadow-md"
                  >
                    <CardContent className="p-5">
                      {isEditing ? (
                        <div className="space-y-3">
                          <Input
                            value={editName}
                            onChange={(event) =>
                              setEditName(event.target.value)
                            }
                            autoFocus
                            disabled={updateMutation.isPending}
                            maxLength={100}
                          />

                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={cancelEdit}
                              disabled={updateMutation.isPending}
                            >
                              <X className="size-4" />
                              Cancel
                            </Button>

                            <Button
                              size="sm"
                              onClick={() => saveEdit(department.id)}
                              disabled={
                                !editName.trim() || updateMutation.isPending
                              }
                            >
                              <Check className="size-4" />
                              {updateMutation.isPending ? "Saving..." : "Save"}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                            {department.name.charAt(0).toUpperCase()}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">
                              {department.name}
                            </p>

                            <p className="mt-0.5 text-xs text-muted-foreground">
                              Department #{department.id}
                            </p>
                          </div>

                          {(canEdit || canDelete) && (
                            <div className="flex shrink-0 items-center gap-1">
                              {canEdit && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="size-8 text-muted-foreground hover:text-foreground"
                                  onClick={() => startEdit(department)}
                                  aria-label={`Edit ${department.name}`}
                                >
                                  <Pencil className="size-4" />
                                </Button>
                              )}

                              {canDelete && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="size-8 text-muted-foreground hover:text-destructive"
                                  disabled={deleteMutation.isPending}
                                  onClick={() => handleDelete(department)}
                                  aria-label={`Delete ${department.name}`}
                                >
                                  <X className="size-4" />
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete department?"
        description={
          departmentToDelete
            ? `Are you sure you want to delete ${departmentToDelete.name}? This action cannot be undone.`
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

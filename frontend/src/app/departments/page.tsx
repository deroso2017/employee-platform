"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { departmentApi } from "@/lib/api";
import type { Department } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { extractErrorMessage } from "@/lib/errors";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Spinner } from "@/components/ui/spinner";

export default function DepartmentsPage() {
  const { loading } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] =
    useState<Department | null>(null);

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ["departments"],
    enabled: !loading,
    queryFn: async () => {
      const res = await departmentApi.getAll();
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (newName: string) => departmentApi.create(newName),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setName("");
      toast.add({
        title: "Department created",
        description: `"${res.data.name}" was added successfully.`,
        type: "success",
      });
    },
    onError: (err) => {
      toast.add({
        title: "Error",
        description: extractErrorMessage(err, "Failed to create department."),
        type: "error",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, newName }: { id: number; newName: string }) =>
      departmentApi.update(id, newName),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setEditingId(null);
      toast.add({
        title: "Department updated",
        description: `"${res.data.name}" was saved.`,
        type: "success",
      });
    },
    onError: (err) => {
      toast.add({
        title: "Error",
        description: extractErrorMessage(err, "Failed to update department."),
        type: "error",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => departmentApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setDeleteDialogOpen(false);
      setDepartmentToDelete(null);
      toast.add({ title: "Department deleted", type: "success" });
    },
    onError: (err) => {
      toast.add({
        title: "Error",
        description: extractErrorMessage(err, "Failed to delete department."),
        type: "error",
      });
    },
  });

  function handleCreate(e: React.SubmitEvent) {
    e.preventDefault();
    createMutation.mutate(name);
  }

  function startEdit(dept: Department) {
    setEditingId(dept.id);
    setEditName(dept.name);
  }

  function handleDelete(department: Department) {
    setDepartmentToDelete(department);
    setDeleteDialogOpen(true);
  }

  function confirmDelete() {
    if (!departmentToDelete) return;

    deleteMutation.mutate(departmentToDelete.id);
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-8">Departments</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create form */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-base">New Department</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-3">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Engineering"
                  required
                />
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full"
                >
                  {createMutation.isPending ? "Creating…" : "Create"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Department list */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Spinner className="size-7" />
              </div>
            ) : departments.length === 0 ? (
              <div className="flex items-center justify-center h-40 rounded-xl border border-dashed text-muted-foreground text-sm">
                No departments yet. Create one to get started.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {departments.map((dept) => (
                  <Card
                    key={dept.id}
                    className="group transition-shadow hover:shadow-md"
                  >
                    <CardContent className="pt-5 pb-4 px-5">
                      {editingId === dept.id ? (
                        <div className="flex gap-2">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-8 text-sm"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            disabled={updateMutation.isPending}
                            onClick={() =>
                              updateMutation.mutate({
                                id: dept.id,
                                newName: editName,
                              })
                            }
                          >
                            {updateMutation.isPending ? "…" : "Save"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingId(null)}
                          >
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                              {dept.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium">{dept.name}</span>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2 text-muted-foreground hover:text-foreground"
                              onClick={() => startEdit(dept)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2 text-destructive hover:text-destructive"
                              disabled={deleteMutation.isPending}
                              onClick={() => handleDelete(dept)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
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
    </div>
  );
}

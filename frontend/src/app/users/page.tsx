"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/lib/api";
import type { User } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import EmployeeFormDialog from "@/components/employees/EmployeeFormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { toast } from "@/components/ui/toast";
import { extractErrorMessage } from "@/lib/errors";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import { Spinner } from "@/components/ui/spinner";
import { Users } from "lucide-react";
import UserFormDialog from "@/components/users/UserFormDialog";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const canCreate = user?.role === "ADMIN";
  const canEdit = user?.role === "ADMIN";
  const canDelete = user?.role === "ADMIN";

  const { data, isLoading } = useQuery({
    queryKey: ["users", page, debouncedSearch],
    enabled: !loading,
    queryFn: async () => {
      const res = debouncedSearch
        ? await userApi.search(debouncedSearch, page)
        : await userApi.getAll(page);
      return res.data;
    },
  });

  const users = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  // Delete mutation with automatic cache invalidation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => userApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });

      setDeleteDialogOpen(false);
      setUserToDelete(null);

      toast.add({
        title: "User deleted",
        type: "success",
      });
    },
    onError: (err) => {
      toast.add({
        title: "Failed to delete user",
        description: extractErrorMessage(err),
        type: "error",
      });
    },
  });

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    setPage(0); // reset to first page on every new search
  }

  function handleClear() {
    setSearch("");
    setPage(0);
  }

  function handleDelete(user: User) {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  }

  function confirmDelete() {
    if (!userToDelete) return;

    deleteMutation.mutate(userToDelete.id);
  }

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(user: User) {
    setEditing(user);
    setDialogOpen(true);
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Users</h1>
          {canCreate && (
            <Button className="hidden" onClick={openCreate}>
              Add User
            </Button>
          )}
        </div>

        <div className="flex gap-2 mb-6">
          <Input
            placeholder="Search by name…"
            value={search}
            onChange={handleSearchChange}
            className="max-w-xs"
          />
          {search && (
            <Button type="button" variant="ghost" onClick={handleClear}>
              Clear
            </Button>
          )}
        </div>

        <div className="rounded-lg border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                {(canEdit || canDelete) && (
                  <TableHead className="w-32">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={canEdit || canDelete ? 3 : 2}
                    className="py-8"
                  >
                    <div className="flex items-center justify-center">
                      <Spinner className="size-7" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={canEdit || canDelete ? 3 : 2}
                    className="py-12"
                  >
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Users className="h-6 w-6 text-muted-foreground" />
                      </div>

                      <h3 className="font-medium">No users found</h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        There are currently no users to display.
                      </p>

                      {canCreate && (
                        <Button className="mt-4" onClick={openCreate}>
                          Add User
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    {(canEdit || canDelete) && (
                      <TableCell>
                        <div className="flex gap-2">
                          {canEdit && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEdit(user)}
                            >
                              Edit
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(user)}
                              className="disabled:opacity-50 disabled:pointer-events-none"
                              disabled
                            >
                              Deactivate
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="text-sm self-center text-muted-foreground">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </main>

      <UserFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ["users"] });
        }}
        user={editing}
      />
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete user?"
        description={
          userToDelete
            ? `Are you sure you want to delete ${userToDelete.email} ${userToDelete.role}? This action cannot be undone.`
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

"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MoreHorizontal,
  Pencil,
  Search,
  Shield,
  Trash2,
  Users as UsersIcon,
} from "lucide-react";

import { userApi } from "@/lib/api";
import type { User } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { extractErrorMessage } from "@/lib/errors";

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

import UserFormDialog from "@/components/users/UserFormDialog";
import { UserRoleDialog } from "./UserRoleDialog";

interface UsersProps {
  createOpen: boolean;
  onCreateOpenChange: (open: boolean) => void;
}

export function Users({ createOpen, onCreateOpenChange }: UsersProps) {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 400);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const [roleUser, setRoleUser] = useState<User | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["users", page, debouncedSearch],
    enabled: !loading,
    queryFn: async () => {
      const response = debouncedSearch
        ? await userApi.search(debouncedSearch, page)
        : await userApi.getAll(page);

      return response.data;
    },
  });

  const users = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  const deleteMutation = useMutation({
    mutationFn: (userId: number) => userApi.delete(userId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });

      setUserToDelete(null);

      toast.add({
        title: "User deleted",
        description: "The user was deleted successfully.",
        type: "success",
      });
    },

    onError: (error) => {
      toast.add({
        title: "Failed to delete user",
        description: extractErrorMessage(
          error,
          "The user could not be deleted.",
        ),
        type: "error",
      });
    },
  });

  function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSearch(event.target.value);
    setPage(0);
  }

  function clearSearch() {
    setSearch("");
    setPage(0);
  }

  function openEdit(selectedUser: User) {
    setEditingUser(selectedUser);
    onCreateOpenChange(true);
  }

  function handleDialogChange(open: boolean) {
    onCreateOpenChange(open);

    if (!open) {
      setEditingUser(null);
    }
  }

  function openDelete(selectedUser: User) {
    setUserToDelete(selectedUser);
  }

  function confirmDelete() {
    if (!userToDelete) {
      return;
    }

    deleteMutation.mutate(userToDelete.id);
  }

  function openRoleChange(user: User) {
    setRoleUser(user);
    setRoleDialogOpen(true);
  }

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="w-full sm:max-w-md">
            <label
              htmlFor="user-search"
              className="mb-2 block text-sm font-medium"
            >
              Search users
            </label>

            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />

              <Input
                id="user-search"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search by email..."
                className="pl-9"
              />
            </div>
          </div>

          {search && (
            <Button type="button" variant="outline" onClick={clearSearch}>
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Users table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>

                <TableHead className="w-[70px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-[320px]">
                    <div className="flex items-center justify-center">
                      <Spinner className="size-7" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-[320px]">
                    <EmptyState hasSearch={Boolean(search.trim())} />
                  </TableCell>
                </TableRow>
              ) : (
                users.map((currentUser) => (
                  <TableRow key={currentUser.id}>
                    <TableCell>
                      <span className="font-medium text-foreground">
                        {currentUser.email}
                      </span>
                    </TableCell>

                    <TableCell>
                      <RoleBadge role={currentUser.role} />
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          aria-label={`Actions for ${currentUser.email}`}
                        >
                          <MoreHorizontal
                            className="size-4"
                            aria-hidden="true"
                          />
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openEdit(currentUser)}
                          >
                            <Pencil
                              className="mr-2 size-4"
                              aria-hidden="true"
                            />
                            Edit
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => openRoleChange(currentUser)}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            Change role
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => openDelete(currentUser)}
                          >
                            <Trash2
                              className="mr-2 size-4"
                              aria-hidden="true"
                            />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((current) => current - 1)}
            >
              Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Edit / create dialog */}
      <UserFormDialog
        open={createOpen}
        onClose={() => handleDialogChange(false)}
        onSaved={() => {
          queryClient.invalidateQueries({
            queryKey: ["users"],
          });
        }}
        user={editingUser}
      />

      {/* Role change dialog */}
      <UserRoleDialog
        key={roleUser?.id ?? "no-user"}
        open={roleDialogOpen}
        onOpenChange={(open) => {
          setRoleDialogOpen(open);

          if (!open) {
            setRoleUser(null);
          }
        }}
        user={roleUser}
      />

      {/* Delete */}
      <ConfirmDialog
        open={userToDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setUserToDelete(null);
          }
        }}
        title="Delete user?"
        description={
          userToDelete
            ? `Are you sure you want to delete "${userToDelete.email}"? This action cannot be undone.`
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

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
        <UsersIcon
          className="size-6 text-muted-foreground"
          aria-hidden="true"
        />
      </div>

      <h3 className="font-medium">
        {hasSearch ? "No users found" : "No users yet"}
      </h3>

      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {hasSearch
          ? "No users match your search. Try a different search term."
          : "There are currently no users to display."}
      </p>
    </div>
  );
}

function RoleBadge({ role }: { role: User["role"] }) {
  const config: Record<
    User["role"],
    {
      label: string;
      className: string;
    }
  > = {
    ADMIN: {
      label: "Admin",
      className: "bg-destructive/10 text-destructive",
    },
    MANAGER: {
      label: "Manager",
      className: "bg-info/10 text-info",
    },
    EMPLOYEE: {
      label: "Employee",
      className: "bg-success/10 text-success",
    },
    USER: {
      label: "User",
      className: "bg-muted text-muted-foreground",
    },
  };

  const item = config[role];

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${item.className}`}
    >
      {item.label}
    </span>
  );
}

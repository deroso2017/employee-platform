"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Link2,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { employeeApi } from "@/lib/api";
import type { Employee } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";

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

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useDebounce } from "@/lib/hooks/useDebounce";
import { toast } from "@/components/ui/toast";
import { extractErrorMessage } from "@/lib/errors";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useProfileImage } from "@/lib/hooks/useProfileImage";
import { LinkUserDialog } from "./LinkUserDialog";

const DEFAULT_AVATAR = "/default-avatar.svg";

function EmployeeAvatar({ employee }: { employee: Employee }) {
  const apiSrc = employee.profileImage
    ? employeeApi.profileImageUrl(employee.id)
    : null;

  const blobUrl = useProfileImage(apiSrc);
  const src = blobUrl ?? DEFAULT_AVATAR;

  return (
    <div className="size-10 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`${employee.firstName} ${employee.lastName}`}
        className="size-full object-cover"
      />
    </div>
  );
}

function getInitials(employee: Employee) {
  return `${employee.firstName.charAt(0)}${employee.lastName.charAt(
    0,
  )}`.toUpperCase();
}

interface EmployeesProps {
  onEdit: (employee: Employee) => void;
  onAdd: () => void;
}

export function Employees({ onEdit, onAdd }: EmployeesProps) {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 400);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(
    null,
  );

  const canCreate = user?.role === "ADMIN" || user?.role === "MANAGER";

  const canEdit = user?.role === "ADMIN";
  const canDelete = user?.role === "ADMIN";

  const [linkUserDialogOpen, setLinkUserDialogOpen] = useState(false);
  const [employeeToLink, setEmployeeToLink] = useState<Employee | null>(null);

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ["employees", page, debouncedSearch],

    enabled: !loading,

    queryFn: async () => {
      const response = debouncedSearch
        ? await employeeApi.search(debouncedSearch, page)
        : await employeeApi.getAll(page);

      return response.data;
    },

    placeholderData: (previousData) => previousData,
  });

  const employees = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  const deleteMutation = useMutation({
    mutationFn: (id: number) => employeeApi.delete(id),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["employees"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });

      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);

      toast.add({
        title: "Employee deleted",
        description: "The employee was successfully removed.",
        type: "success",
      });
    },

    onError: (error) => {
      toast.add({
        title: "Failed to delete employee",
        description: extractErrorMessage(error),
        type: "error",
      });
    },
  });

  function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSearch(event.target.value);
    setPage(0);
  }

  function handleClear() {
    setSearch("");
    setPage(0);
  }

  function handleDelete(employee: Employee) {
    setEmployeeToDelete(employee);
    setDeleteDialogOpen(true);
  }

  function confirmDelete() {
    if (!employeeToDelete) {
      return;
    }

    deleteMutation.mutate(employeeToDelete.id);
  }

  function handleLinkUser(employee: Employee) {
    setEmployeeToLink(employee);
    setLinkUserDialogOpen(true);
  }

  const hasActions = canEdit || canDelete;

  return (
    <>
      <section className="space-y-4">
        {/* Toolbar */}
        <div className="rounded-xl border border-border/80 bg-card p-3 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={handleSearchChange}
                placeholder="Search employees by name..."
                className="h-10 pl-9 pr-9"
              />

              {search && (
                <button
                  type="button"
                  onClick={handleClear}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground sm:justify-end">
              <div className="flex items-center gap-2">
                <Users className="size-4" />

                <span>
                  {totalElements}{" "}
                  {totalElements === 1 ? "employee" : "employees"}
                </span>
              </div>

              {isFetching && !isLoading && (
                <span className="text-xs">Updating...</span>
              )}
            </div>
          </div>
        </div>

        {/* Error */}
        {isError && (
          <div
            role="alert"
            className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            Unable to load employees. Please try again.
          </div>
        )}

        {/* Desktop table */}
        <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-14" />

                <TableHead className="font-medium text-muted-foreground">
                  Employee
                </TableHead>

                <TableHead className="font-medium text-muted-foreground">
                  Email
                </TableHead>

                <TableHead className="font-medium text-muted-foreground">
                  Department
                </TableHead>

                <TableHead className="font-medium text-muted-foreground">
                  Account
                </TableHead>

                {hasActions && <TableHead className="w-16" />}
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="size-10 animate-pulse rounded-full bg-muted" />
                    </TableCell>

                    <TableCell>
                      <div className="space-y-2">
                        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                        <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                    </TableCell>

                    <TableCell>
                      <div className="h-6 w-24 animate-pulse rounded-md bg-muted" />
                    </TableCell>

                    <TableCell>
                      <div className="h-5 w-16 animate-pulse rounded bg-muted" />
                    </TableCell>

                    {hasActions && (
                      <TableCell>
                        <div className="size-8 animate-pulse rounded-md bg-muted" />
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={hasActions ? 6 : 5} className="h-72">
                    <div className="flex flex-col items-center justify-center px-6 text-center">
                      <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Users className="size-6" />
                      </div>

                      <h3 className="font-semibold">
                        {search ? "No employees found" : "No employees yet"}
                      </h3>

                      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                        {search
                          ? "Try a different search term."
                          : "Create your first employee to get started."}
                      </p>

                      {search ? (
                        <Button
                          variant="ghost"
                          className="mt-4"
                          onClick={handleClear}
                        >
                          Clear search
                        </Button>
                      ) : (
                        canCreate && (
                          <Button className="mt-4" onClick={onAdd}>
                            Add employee
                          </Button>
                        )
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((employee) => (
                  <TableRow
                    key={employee.id}
                    className="border-border transition-colors hover:bg-muted/40"
                  >
                    <TableCell>
                      <EmployeeAvatar employee={employee} />
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-foreground">
                            {employee.firstName} {employee.lastName}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            Employee #{employee.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-muted-foreground">
                        {employee.email}
                      </span>
                    </TableCell>

                    <TableCell>
                      {employee.department?.name ? (
                        <span className="inline-flex rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                          {employee.department.name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          Unassigned
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      {employee.userId ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
                          <span className="size-1.5 rounded-full bg-success" />
                          Linked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="size-1.5 rounded-full bg-muted-foreground/40" />
                          No account
                        </span>
                      )}
                    </TableCell>

                    {hasActions && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            aria-label={`Actions for ${getInitials(employee)}`}
                            className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            {!employee.userId && (
                              <DropdownMenuItem
                                onClick={() => handleLinkUser(employee)}
                              >
                                <Link2 className="mr-2 size-4" />
                                Link to user
                              </DropdownMenuItem>
                            )}

                            {!employee.userId && canEdit && (
                              <DropdownMenuSeparator />
                            )}

                            {canEdit && (
                              <DropdownMenuItem
                                onClick={() => onEdit(employee)}
                              >
                                <Pencil className="mr-2 size-4" />
                                Edit
                              </DropdownMenuItem>
                            )}

                            {canEdit && canDelete && <DropdownMenuSeparator />}

                            {canDelete && (
                              <DropdownMenuItem
                                onClick={() => handleDelete(employee)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 size-4" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Page {page + 1} of {totalPages}
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0 || isFetching}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1 || isFetching}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </section>

      <LinkUserDialog
        key={employeeToLink?.id ?? "no-employee"}
        open={linkUserDialogOpen}
        onOpenChange={(open) => {
          setLinkUserDialogOpen(open);

          if (!open) {
            setEmployeeToLink(null);
          }
        }}
        employee={employeeToLink}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete employee?"
        description={
          employeeToDelete
            ? `Are you sure you want to delete ${employeeToDelete.firstName} ${employeeToDelete.lastName}? This action cannot be undone.`
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

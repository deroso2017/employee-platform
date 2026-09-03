"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeApi } from "@/lib/api";
import type { Employee } from "@/lib/types";
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

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);

  const canCreate = user?.role === "ADMIN" || user?.role === "MANAGER";
  const canEdit = user?.role === "ADMIN";
  const canDelete = user?.role === "ADMIN";

  // Fetch employees with automatic caching and background refetching
  const { data, isLoading } = useQuery({
    queryKey: ["employees", page, query],
    enabled: !loading, // wait for auth session to restore before fetching
    queryFn: async () => {
      const res = query
        ? await employeeApi.search(query, page)
        : await employeeApi.getAll(page);
      return res.data;
    },
  });

  const employees = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  // Delete mutation with automatic cache invalidation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => employeeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });

  async function handleDelete(id: number) {
    if (!confirm("Delete this employee?")) return;
    deleteMutation.mutate(id);
  }

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(emp: Employee) {
    setEditing(emp);
    setDialogOpen(true);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(0);
    setQuery(search);
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Employees</h1>
          {canCreate && <Button onClick={openCreate}>Add Employee</Button>}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <Input
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Button type="submit" variant="secondary">
            Search
          </Button>
          {query && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSearch("");
                setQuery("");
                setPage(0);
              }}
            >
              Clear
            </Button>
          )}
        </form>

        <div className="rounded-lg border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                {(canEdit || canDelete) && (
                  <TableHead className="w-32">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Loading…
                  </TableCell>
                </TableRow>
              ) : employees.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No employees found.
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell>
                      {emp.firstName} {emp.lastName}
                    </TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>{emp.department?.name ?? "—"}</TableCell>
                    {(canEdit || canDelete) && (
                      <TableCell>
                        <div className="flex gap-2">
                          {canEdit && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEdit(emp)}
                            >
                              Edit
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(emp.id)}
                            >
                              Delete
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

      <EmployeeFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ["employees"] });
        }}
        employee={editing}
      />
    </div>
  );
}

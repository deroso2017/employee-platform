"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Employees } from "@/components/employees/Employees";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import type { Employee } from "@/lib/types";
import { EmployeeFormDialog } from "@/components/employees/EmployeeFormDialog";
import { RefreshButton } from "@/components/ui/RefreshButton";

export default function DashboardPage() {
  const { user } = useAuth();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);

  const canCreate = user?.role === "ADMIN" || user?.role === "MANAGER";

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(emp: Employee) {
    setEditing(emp);
    setDialogOpen(true);
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />

      <PageContainer>
        <PageHeader
          title="Employees"
          description="Manage your organization's employees, view records, and configure access."
          actions={
            <div className="flex items-center gap-2">
              {canCreate && <Button onClick={openCreate}>Add Employee</Button>}
              <RefreshButton queryKey="employees"></RefreshButton>
            </div>
          }
        />

        <Employees onEdit={openEdit} onAdd={openCreate} />
      </PageContainer>

      <EmployeeFormDialog
        key={editing?.id ?? "create"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        employee={editing}
      />
    </div>
  );
}

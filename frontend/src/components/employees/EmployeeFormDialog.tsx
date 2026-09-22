"use client";

import { useQuery } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { departmentApi } from "@/lib/api";
import type { Department, Employee } from "@/lib/types";

import { EmployeeForm } from "./EmployeeForm";

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
}

export function EmployeeFormDialog({
  open,
  onOpenChange,
  employee,
}: EmployeeFormDialogProps) {
  const { data: departmentsResponse, isLoading: departmentsLoading } = useQuery(
    {
      queryKey: ["departments"],
      queryFn: () => departmentApi.getAll(),
      enabled: open,
    },
  );

  const departments: Department[] = departmentsResponse?.data ?? [];

  const isEditing = Boolean(employee);

  function handleClose() {
    onOpenChange(false);
  }

  function handleSaved() {
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit employee" : "Create employee"}
          </DialogTitle>

          <DialogDescription>
            {isEditing
              ? "Update the employee information and profile."
              : "Add a new employee to your organization."}
          </DialogDescription>
        </DialogHeader>

        {departmentsLoading ? (
          <div className="flex min-h-48 items-center justify-center">
            <div className="size-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
          </div>
        ) : (
          <EmployeeForm
            key={employee?.id ?? "create"}
            employee={employee}
            departments={departments}
            onClose={handleClose}
            onSaved={handleSaved}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

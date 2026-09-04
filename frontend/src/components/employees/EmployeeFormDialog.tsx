"use client";

import { departmentApi } from "@/lib/api";
import type { Employee } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { EmployeeForm } from "./EmployeeForm";

interface EmployeeFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  employee?: Employee | null;
}

// ---------------------------------------------------------------------------
// Outer shell — fetches departments and remounts the form via key.
// ---------------------------------------------------------------------------
export default function EmployeeFormDialog({
  open,
  onClose,
  onSaved,
  employee,
}: EmployeeFormDialogProps) {
  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentApi.getAll().then((r) => r.data),
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {employee ? "Edit Employee" : "New Employee"}
          </DialogTitle>
        </DialogHeader>
        {open && (
          <EmployeeForm
            key={`${employee?.id ?? "new"}-${open}`}
            employee={employee}
            departments={departments}
            onClose={onClose}
            onSaved={onSaved}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

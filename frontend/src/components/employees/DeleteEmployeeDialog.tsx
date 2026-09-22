"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { employeeApi } from "@/lib/api";
import type { Employee } from "@/lib/types";

interface DeleteEmployeeDialogProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteEmployeeDialog({
  employee,
  open,
  onOpenChange,
}: DeleteEmployeeDialogProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => {
      if (!employee) {
        throw new Error("Employee is required.");
      }

      return employeeApi.delete(employee.id);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["employees"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });

      onOpenChange(false);
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete employee?</AlertDialogTitle>

          <AlertDialogDescription>
            This will permanently delete{" "}
            <strong>
              {employee
                ? `${employee.firstName} ${employee.lastName}`
                : "this employee"}
              .
            </strong>{" "}
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              mutation.mutate();
            }}
            disabled={mutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {mutation.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 size-4" />
            )}
            Delete employee
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

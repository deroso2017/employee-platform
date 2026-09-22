"use client";

import { Mail, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import type { Employee } from "@/lib/types";

interface EmployeesMobileListProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

function getInitials(employee: Employee) {
  return `${employee.firstName.charAt(0)}${employee.lastName.charAt(
    0,
  )}`.toUpperCase();
}

export function EmployeesMobileList({
  employees,
  onEdit,
  onDelete,
}: EmployeesMobileListProps) {
  return (
    <div className="space-y-3 md:hidden">
      {employees.map((employee) => (
        <article
          key={employee.id}
          className="rounded-xl border border-border/80 bg-card p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar className="size-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(employee)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <h3 className="truncate font-medium">
                  {employee.firstName} {employee.lastName}
                </h3>

                <p className="text-xs text-muted-foreground">
                  Employee #{employee.id}
                </p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={`Actions for ${employee.firstName} ${employee.lastName}`}
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <MoreHorizontal className="size-4" />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(employee)}>
                  <Pencil className="mr-2 size-4" />
                  Edit
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => onDelete(employee)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-4 space-y-2.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="size-4 shrink-0" />
              <span className="truncate">{employee.email}</span>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
              <span className="text-muted-foreground">Department</span>

              <span className="font-medium">
                {employee.department?.name ?? "Unassigned"}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Account</span>

              {employee.userId ? (
                <span className="font-medium text-success">Linked</span>
              ) : (
                <span className="text-muted-foreground">Not linked</span>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

"use client";

import { MoreHorizontal, Pencil, Trash2, UserRound } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import type { Employee } from "@/lib/types";

interface EmployeesTableProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

function getInitials(employee: Employee) {
  return `${employee.firstName.charAt(0)}${employee.lastName.charAt(
    0,
  )}`.toUpperCase();
}

export function EmployeesTable({
  employees,
  onEdit,
  onDelete,
}: EmployeesTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-5 py-3 text-left font-medium text-muted-foreground">
                Employee
              </th>

              <th className="px-5 py-3 text-left font-medium text-muted-foreground">
                Email
              </th>

              <th className="px-5 py-3 text-left font-medium text-muted-foreground">
                Department
              </th>

              <th className="px-5 py-3 text-left font-medium text-muted-foreground">
                Account
              </th>

              <th className="w-16 px-4 py-3" />
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {employees.map((employee) => (
              <tr
                key={employee.id}
                className="group transition-colors hover:bg-muted/40"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                        {getInitials(employee)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {employee.firstName} {employee.lastName}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        ID #{employee.id}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <span className="text-muted-foreground">
                    {employee.email}
                  </span>
                </td>

                <td className="px-5 py-4">
                  {employee.department?.name ? (
                    <span className="inline-flex rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                      {employee.department.name}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                  )}
                </td>

                <td className="px-5 py-4">
                  {employee.userId ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
                      <span className="size-1.5 rounded-full bg-success" />
                      Linked
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <span className="size-1.5 rounded-full bg-muted-foreground/50" />
                      No account
                    </span>
                  )}
                </td>

                <td className="px-4 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      aria-label={`Actions for ${employee.firstName} ${employee.lastName}`}
                      className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(employee)}>
                        <Pencil className="mr-2 size-4" />
                        Edit
                      </DropdownMenuItem>

                      <DropdownMenuItem>
                        <UserRound className="mr-2 size-4" />
                        View profile
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={() => onDelete(employee)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

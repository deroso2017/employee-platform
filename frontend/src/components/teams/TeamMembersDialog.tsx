"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, UserMinus, UserPlus, Users } from "lucide-react";

import { employeeApi, teamApi } from "@/lib/api";
import type { Employee, Team } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { extractErrorMessage } from "@/lib/errors";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TeamMembersDialogProps {
  open: boolean;
  onClose: () => void;
  team: Team;
  canManage: boolean;
  onChanged: () => void;
}

export default function TeamMembersDialog({
  open,
  onClose,
  team,
  canManage,
  onChanged,
}: TeamMembersDialogProps) {
  const queryClient = useQueryClient();

  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ["team-members", team.id],
    enabled: open,
    queryFn: async () => {
      const response = await teamApi.getMembers(team.id);
      return response.data;
    },
  });

  const { data: employeePage, isLoading: employeesLoading } = useQuery({
    queryKey: ["employees", "team-members-selector"],
    enabled: open && canManage,
    queryFn: async () => {
      const response = await employeeApi.getAll(0, 100);
      return response.data;
    },
  });

  const employees = employeePage?.content ?? [];

  const memberIds = useMemo(
    () => new Set(members.map((member) => member.id)),
    [members],
  );

  const availableEmployees = useMemo(
    () => employees.filter((employee) => !memberIds.has(employee.id)),
    [employees, memberIds],
  );

  const addMutation = useMutation({
    mutationFn: (employeeId: number) => teamApi.addMember(team.id, employeeId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["team-members", team.id],
      });

      queryClient.invalidateQueries({
        queryKey: ["teams"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });

      setSelectedEmployeeId("");

      onChanged();

      toast.add({
        title: "Member added",
        description: "The employee was added to the team.",
        type: "success",
      });
    },

    onError: (error) => {
      toast.add({
        title: "Failed to add member",
        description: extractErrorMessage(
          error,
          "Unable to add the employee to the team.",
        ),
        type: "error",
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (employeeId: number) =>
      teamApi.removeMember(team.id, employeeId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["team-members", team.id],
      });

      queryClient.invalidateQueries({
        queryKey: ["teams"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });

      onChanged();

      toast.add({
        title: "Member removed",
        description: "The employee was removed from the team.",
        type: "success",
      });
    },

    onError: (error) => {
      toast.add({
        title: "Failed to remove member",
        description: extractErrorMessage(
          error,
          "Unable to remove the employee from the team.",
        ),
        type: "error",
      });
    },
  });

  function handleAddMember() {
    const employeeId = Number(selectedEmployeeId);

    if (!employeeId) {
      return;
    }

    addMutation.mutate(employeeId);
  }

  function handleRemoveMember(employee: Employee) {
    removeMutation.mutate(employee.id);
  }

  const isLoading = membersLoading || (canManage && employeesLoading);

  const isMutating = addMutation.isPending || removeMutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value && !isMutating) {
          onClose();
        }
      }}
    >
      <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="size-5" />
            </div>

            <div className="min-w-0">
              <DialogTitle className="truncate">{team.name}</DialogTitle>

              <DialogDescription className="mt-0.5">
                {members.length} {members.length === 1 ? "member" : "members"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {canManage && (
          <div className="border-b border-border bg-muted/20 px-6 py-4">
            <div className="flex gap-2">
              <Select
                value={selectedEmployeeId}
                onValueChange={(value) => setSelectedEmployeeId(value ?? "")}
                disabled={employeesLoading || addMutation.isPending}
              >
                <SelectTrigger className="min-w-0 flex-1">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>

                <SelectContent>
                  {availableEmployees.length === 0 ? (
                    <SelectItem value="__empty__" disabled>
                      No employees available
                    </SelectItem>
                  ) : (
                    availableEmployees.map((employee) => (
                      <SelectItem
                        key={employee.id}
                        value={employee.id.toString()}
                      >
                        {employee.firstName} {employee.lastName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              <Button
                type="button"
                onClick={handleAddMember}
                disabled={!selectedEmployeeId || addMutation.isPending}
              >
                {addMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <UserPlus className="size-4" />
                )}

                <span className="hidden sm:inline">Add</span>
              </Button>
            </div>

            {!employeesLoading &&
              availableEmployees.length === 0 &&
              employees.length > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  All employees are already members of this team.
                </p>
              )}
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner className="size-7" />
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
                <Users className="size-6 text-muted-foreground" />
              </div>

              <h3 className="font-medium">No team members</h3>

              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                This team doesn&apos;t have any members yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {employee.firstName.charAt(0).toUpperCase()}
                    {employee.lastName.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {employee.firstName} {employee.lastName}
                    </p>

                    <p className="truncate text-xs text-muted-foreground">
                      {employee.email}
                    </p>
                  </div>

                  {canManage && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveMember(employee)}
                      disabled={removeMutation.isPending}
                      aria-label={`Remove ${employee.firstName} ${employee.lastName}`}
                    >
                      {removeMutation.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <UserMinus className="size-4" />
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-border px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isMutating}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserPlus, UserMinus, Users } from "lucide-react";

import { employeeApi, teamApi } from "@/lib/api";
import type { Employee, Team } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { extractErrorMessage } from "@/lib/errors";

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

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");

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

      setSelectedEmployeeId("");

      onChanged();

      toast.add({
        title: "Member added",
        type: "success",
      });
    },

    onError: (error) => {
      toast.add({
        title: "Failed to add member",
        description: extractErrorMessage(error),
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

      onChanged();

      toast.add({
        title: "Member removed",
        type: "success",
      });
    },

    onError: (error) => {
      toast.add({
        title: "Failed to remove member",
        description: extractErrorMessage(error),
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

  if (!open) {
    return null;
  }

  const loading = membersLoading || (canManage && employeesLoading);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-lg border bg-background shadow-lg">
        <div className="border-b p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>

            <div>
              <h2 className="text-lg font-semibold">{team.name}</h2>

              <p className="text-sm text-muted-foreground">
                {members.length} {members.length === 1 ? "member" : "members"}
              </p>
            </div>
          </div>
        </div>

        {canManage && (
          <div className="border-b p-6">
            <div className="flex gap-2">
              <select
                value={selectedEmployeeId}
                onChange={(event) => setSelectedEmployeeId(event.target.value)}
                disabled={employeesLoading || addMutation.isPending}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select employee...</option>

                {availableEmployees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName}
                  </option>
                ))}
              </select>

              <Button
                type="button"
                onClick={handleAddMember}
                disabled={!selectedEmployeeId || addMutation.isPending}
              >
                <UserPlus className="mr-1.5 h-4 w-4" />
                Add
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

        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner className="size-7" />
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>

              <p className="font-medium">No team members</p>

              <p className="mt-1 text-sm text-muted-foreground">
                This team doesn&apos;t have any members yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {employee.firstName} {employee.lastName}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {employee.email}
                    </p>
                  </div>

                  {canManage && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveMember(employee)}
                      disabled={removeMutation.isPending}
                    >
                      <UserMinus className="mr-1.5 h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t p-4">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={addMutation.isPending || removeMutation.isPending}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

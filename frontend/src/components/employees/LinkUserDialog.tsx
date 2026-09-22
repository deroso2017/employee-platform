"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { employeeApi, userApi } from "@/lib/api";
import type { Employee, User } from "@/lib/types";
import { extractErrorMessage } from "@/lib/errors";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";

interface LinkUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
}

export function LinkUserDialog({
  open,
  onOpenChange,
  employee,
}: LinkUserDialogProps) {
  const queryClient = useQueryClient();

  const [selectedUserId, setSelectedUserId] = useState("");

  const usersQuery = useQuery({
    queryKey: ["users", "linkable"],
    queryFn: async () => {
      const response = await userApi.getLinkable(0, 100);

      return response.data.content;
    },
    enabled: open,
  });

  const linkMutation = useMutation({
    mutationFn: () => {
      if (!employee) {
        throw new Error("No employee selected.");
      }

      if (!selectedUserId) {
        throw new Error("Please select a user.");
      }

      return employeeApi.linkUser(employee.id, Number(selectedUserId));
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["employees"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["users"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["dashboard"],
        }),
      ]);

      setSelectedUserId("");

      toast.add({
        title: "User linked",
        description: "The user account has been linked successfully.",
        type: "success",
      });

      onOpenChange(false);
    },

    onError: (error) => {
      toast.add({
        title: "Failed to link user",
        description: extractErrorMessage(
          error,
          "The user could not be linked to this employee.",
        ),
        type: "error",
      });
    },
  });

  function handleOpenChange(value: boolean) {
    if (!value) {
      setSelectedUserId("");
    }

    onOpenChange(value);
  }

  function handleSubmit() {
    if (!selectedUserId || linkMutation.isPending) {
      return;
    }

    linkMutation.mutate();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Link user account</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-sm font-medium">Employee</p>

            <p className="mt-1 text-sm text-muted-foreground">
              {employee?.firstName} {employee?.lastName}
            </p>

            {employee?.email && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {employee.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="link-user" className="text-sm font-medium">
              User account
            </label>

            <Select
              value={selectedUserId}
              onValueChange={(value) => {
                if (value) {
                  setSelectedUserId(value);
                }
              }}
              disabled={usersQuery.isLoading || linkMutation.isPending}
            >
              <SelectTrigger id="link-user" className="w-full">
                <SelectValue>
                  {selectedUserId
                    ? usersQuery.data?.find(
                        (user: User) => String(user.id) === selectedUserId,
                      )?.email
                    : "Select a user"}
                </SelectValue>
              </SelectTrigger>

              <SelectContent>
                {usersQuery.data?.map((user: User) => (
                  <SelectItem key={user.id} value={String(user.id)}>
                    {user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {usersQuery.isLoading && (
              <p className="text-xs text-muted-foreground">
                Loading available users...
              </p>
            )}

            {usersQuery.isError && (
              <p className="text-sm text-destructive">
                Failed to load available users.
              </p>
            )}

            {!usersQuery.isLoading &&
              !usersQuery.isError &&
              usersQuery.data?.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No available user accounts found.
                </p>
              )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={linkMutation.isPending}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={
              !selectedUserId || linkMutation.isPending || usersQuery.isLoading
            }
          >
            {linkMutation.isPending ? "Linking..." : "Link user"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

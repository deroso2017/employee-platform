"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { Role, User } from "@/lib/types";
import { userApi } from "@/lib/api";
import { extractErrorMessage } from "@/lib/errors";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";

interface UserRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

const roles: Role[] = ["USER", "EMPLOYEE", "MANAGER", "ADMIN"];

function formatRole(role: Role) {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

export function UserRoleDialog({
  open,
  onOpenChange,
  user,
}: UserRoleDialogProps) {
  const queryClient = useQueryClient();

  const [role, setRole] = useState<Role>(user?.role ?? "USER");

  const [serverError, setServerError] = useState("");

  const changeRoleMutation = useMutation({
    mutationFn: () => {
      if (!user) {
        throw new Error("No user selected.");
      }
      console.log(user.id);
      console.log(user.email);
      return userApi.changeRole(user.id, role);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["users"],
      });

      toast.add({
        title: "Role updated",
        type: "success",
      });

      onOpenChange(false);
    },

    onError: (error) => {
      setServerError(extractErrorMessage(error, "Failed to change user role."));
    },
  });

  function handleRoleChange(value: string | null) {
    if (value) {
      setRole(value as Role);
    }
  }

  function handleSubmit() {
    if (!user || role === user.role) {
      return;
    }

    setServerError("");
    changeRoleMutation.mutate();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Change user role</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <p className="text-sm font-medium text-foreground">{user?.email}</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Change the access role for this user.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-role">Role</Label>

            <Select value={role} onValueChange={handleRoleChange}>
              <SelectTrigger id="user-role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>

              <SelectContent>
                {roles.map((item) => (
                  <SelectItem key={item} value={item}>
                    {formatRole(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {serverError && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {serverError}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={changeRoleMutation.isPending}
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={
              !user || role === user.role || changeRoleMutation.isPending
            }
          >
            {changeRoleMutation.isPending ? "Updating..." : "Change role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

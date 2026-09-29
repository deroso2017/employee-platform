"use client";

import { useState, type SubmitEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, KeyRound, RefreshCw } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "./PasswordInput";
import type { ChangePasswordInput } from "@/lib/types";
import { authApi } from "@/lib/api";
import { toast } from "../ui/toast";
import { extractErrorMessage } from "@/lib/errors";

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: ChangePasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [passwordChanged, setPasswordChanged] = useState(false);

  const passwordMutation = useMutation({
    // Accept the single input object matching ChangePasswordInput
    mutationFn: (input: ChangePasswordInput) =>
      authApi.changePassword(input.currentPassword, input.newPassword),

    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setFormError(null);
      setPasswordChanged(true);

      setTimeout(() => {
        onOpenChange(false);
        setPasswordChanged(false);
      }, 1500);

      toast.add({
        title: "Password changed!",
        description: "Password changed successfully.",
        type: "success",
      });
    },

    onError: (error) => {
      toast.add({
        title: "Unable to change password",
        description: extractErrorMessage(error, "Failed to change password."),
        type: "error",
      });
    },
  });

  function handlePasswordSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setPasswordChanged(false);

    if (newPassword.length < 8) {
      setFormError("Your new password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError("The new passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setFormError("Choose a new password different from your current one.");
      return;
    }

    passwordMutation.mutate({
      currentPassword,
      newPassword,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="size-5 text-muted-foreground" />
            Change password
          </DialogTitle>
          <DialogDescription>
            Use a strong password you don’t use elsewhere. At least 8
            characters.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-2">
          <PasswordInput
            id="current-password"
            label="Current password"
            value={currentPassword}
            onChange={setCurrentPassword}
            visible={passwordVisible}
            onToggleVisibility={() => setPasswordVisible((v) => !v)}
            autoComplete="current-password"
          />

          <PasswordInput
            id="new-password"
            label="New password"
            value={newPassword}
            onChange={setNewPassword}
            visible={passwordVisible}
            onToggleVisibility={() => setPasswordVisible((v) => !v)}
            autoComplete="new-password"
          />

          <PasswordInput
            id="confirm-password"
            label="Confirm new password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            visible={passwordVisible}
            onToggleVisibility={() => setPasswordVisible((v) => !v)}
            autoComplete="new-password"
          />

          {formError && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
            >
              {formError}
            </div>
          )}

          {passwordChanged && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-lg border border-success/20 bg-success/5 px-3 py-2.5 text-sm text-success"
            >
              <CheckCircle2 className="size-4 shrink-0" />
              Your password has been changed.
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={passwordMutation.isPending}>
              {passwordMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 size-4 animate-spin" />
                  Updating…
                </>
              ) : (
                "Update password"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

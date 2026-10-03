"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { userSchema, type UserFormValues } from "@/lib/schemas";
import { userApi } from "@/lib/api";
import type { User } from "@/lib/types";
import { extractErrorMessage } from "@/lib/errors";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROLES = ["ADMIN", "MANAGER", "EMPLOYEE", "USER"] as const;

interface UserFormProps {
  user: User | null | undefined;
  onClose: () => void;
  onSaved: () => void;
}

export function UserForm({ user, onClose, onSaved }: UserFormProps) {
  const [serverError, setServerError] = useState("");

  const isEditMode = Boolean(user);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: user?.email ?? "",
      password: "",
      role: user?.role ?? "USER",
    },
  });

  async function onSubmit(values: UserFormValues) {
    setServerError("");

    try {
      if (user) {
        await userApi.update(user.id, {
          email: values.email,
          ...(values.password ? { password: values.password } : {}),
          role: values.role,
        });
      } else {
        await userApi.create({
          email: values.email,
          password: values.password,
          role: values.role,
        });
      }

      onSaved();
      onClose();
    } catch (error) {
      setServerError(
        extractErrorMessage(
          error,
          isEditMode ? "Failed to update user." : "Failed to create user.",
        ),
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Account information */}
      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold">Account information</h3>

          <p className="mt-1 text-xs text-muted-foreground">
            {isEditMode
              ? "Update the user's account details and access role."
              : "Create an account and assign an access role."}
          </p>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>

          <Input
            id="email"
            type="email"
            placeholder="user@example.com"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />

          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Password {isEditMode && "*"}</Label>

          <Input
            id="password"
            type="password"
            placeholder={
              isEditMode
                ? "Leave blank to keep current password"
                : "Enter a temporary password"
            }
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />

          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}

          {isEditMode && (
            <p className="text-xs text-muted-foreground">
              Leave blank if you do not want to change the password.
            </p>
          )}
        </div>

        {/* Role */}
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>

          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>

                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {formatRole(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          {errors.role && (
            <p className="text-sm text-destructive">{errors.role.message}</p>
          )}

          <p className="text-xs text-muted-foreground">
            The role determines which parts of the application the user can
            access.
          </p>
        </div>
      </section>

      {serverError && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2">
          <p className="text-sm text-destructive">{serverError}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? isEditMode
              ? "Saving..."
              : "Creating..."
            : isEditMode
              ? "Save changes"
              : "Create user"}
        </Button>
      </div>
    </form>
  );
}

function formatRole(role: (typeof ROLES)[number]) {
  const labels: Record<(typeof ROLES)[number], string> = {
    ADMIN: "Admin",
    MANAGER: "Manager",
    EMPLOYEE: "Employee",
    USER: "User",
  };

  return labels[role];
}

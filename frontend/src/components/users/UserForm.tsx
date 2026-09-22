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

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: user?.email ?? "",
      password: user?.password ?? "",
      role: user?.role ?? "",
    },
  });

  async function onSubmit(values: UserFormValues) {
    setServerError("");

    try {
      if (user) {
        await userApi.update(user.id, {
          email: values.email,
          password: values.password,
          role: values.role,
        });
      }

      onSaved();
      onClose();
    } catch (error) {
      setServerError(extractErrorMessage(error, "Failed to save user."));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Account information */}
      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold">Account information</h3>

          <p className="mt-1 text-xs text-muted-foreground">
            Update the user&apos;s account details and access role.
          </p>
        </div>

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

        {/* <div className="space-y-2">
          <Label htmlFor="role">Role</Label>

          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Select
                disabled
                value={field.value ?? ""}
                onValueChange={(value) => field.onChange(value ?? "")}
              >
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
            User roles cannot currently be changed from this form.
          </p>
        </div> */}
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
          {isSubmitting ? "Saving..." : "Save changes"}
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

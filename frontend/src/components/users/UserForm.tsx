"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema, type UserFormValues } from "@/lib/schemas";
import { userApi } from "@/lib/api";
import type { User } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { extractErrorMessage } from "@/lib/errors";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEFAULT_AVATAR = "/default-avatar.svg";
const ROLES = ["ADMIN", "MANAGER", "EMPLOYEE", "USER"] as const;

// ---------------------------------------------------------------------------
// Inner form — initializes state from props on mount, remounted via `key`.
// ---------------------------------------------------------------------------
interface FormProps {
  user: User | null | undefined;
  onClose: () => void;
  onSaved: () => void;
}

export function UserForm({ user, onClose, onSaved }: FormProps) {
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
    } catch (err) {
      setServerError(extractErrorMessage(err, "Failed to save user."));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
      {/* Profile image */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-24 h-24 rounded-full overflow-hidden border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={DEFAULT_AVATAR}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <div></div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>
      {/* <div className="space-y-1">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div> */}

      {/* Role Select Dropdown */}
      <div className="space-y-1">
        <Label htmlFor="role">Role</Label>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Select
              disabled
              value={field.value ?? ""}
              onValueChange={(v) => field.onChange(v || "")}
            >
              <SelectTrigger className="w-full" id="role">
                <SelectValue placeholder="Select a role">
                  {field.value ? field.value : "Select a role"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.role && (
          <p className="text-sm text-destructive">{errors.role.message}</p>
        )}
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}

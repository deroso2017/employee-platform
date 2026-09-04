"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { employeeSchema, type EmployeeFormValues } from "@/lib/schemas";
import { employeeApi } from "@/lib/api";
import type { Employee, Department } from "@/lib/types";
import { useProfileImage } from "@/lib/hooks/useProfileImage";
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

const DEFAULT_AVATAR = "/default-avatar.svg";

// ---------------------------------------------------------------------------
// Inner form — initializes state from props on mount, remounted via `key`.
// ---------------------------------------------------------------------------
interface FormProps {
  employee: Employee | null | undefined;
  departments: Department[];
  onClose: () => void;
  onSaved: () => void;
}

export function EmployeeForm({
  employee,
  departments,
  onClose,
  onSaved,
}: FormProps) {
  const [serverError, setServerError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const savedImageApiUrl = employee?.profileImage
    ? employeeApi.profileImageUrl(employee.id)
    : null;
  const savedBlobUrl = useProfileImage(savedImageApiUrl);
  const displayUrl = previewUrl ?? savedBlobUrl ?? DEFAULT_AVATAR;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: employee?.firstName ?? "",
      lastName: employee?.lastName ?? "",
      email: employee?.email ?? "",
      departmentId: employee?.department?.id?.toString() ?? null,
    },
  });

  // Revoke blob URL on unmount / when preview changes
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function onSubmit(values: EmployeeFormValues) {
    setServerError("");
    try {
      let savedEmployee: Employee;

      if (employee) {
        const { data } = await employeeApi.update(employee.id, {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
        });
        savedEmployee = data;
        if (values.departmentId) {
          await employeeApi.assignDepartment(
            employee.id,
            Number(values.departmentId),
          );
        }
      } else {
        const { data } = await employeeApi.create({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
        });
        savedEmployee = data;
      }

      if (imageFile) {
        await employeeApi.uploadProfileImage(savedEmployee.id, imageFile);
      }

      onSaved();
      onClose();
    } catch {
      setServerError("Failed to save employee.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
      {/* Profile image */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-24 h-24 rounded-full overflow-hidden border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayUrl}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            {savedBlobUrl || imageFile ? "Change Photo" : "Upload Photo"}
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="firstName">First Name</Label>
        <Input
          id="firstName"
          aria-invalid={!!errors.firstName}
          {...register("firstName")}
        />
        {errors.firstName && (
          <p className="text-sm text-destructive">{errors.firstName.message}</p>
        )}
      </div>
      <div className="space-y-1">
        <Label htmlFor="lastName">Last Name</Label>
        <Input
          id="lastName"
          aria-invalid={!!errors.lastName}
          {...register("lastName")}
        />
        {errors.lastName && (
          <p className="text-sm text-destructive">{errors.lastName.message}</p>
        )}
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
      {employee && (
        <div className="space-y-1">
          <Label>Department</Label>
          <Controller
            name="departmentId"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ?? ""}
                onValueChange={(v) => field.onChange(v || null)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id.toString()}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      )}
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

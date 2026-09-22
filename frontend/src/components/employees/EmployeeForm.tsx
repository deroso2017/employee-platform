"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload, UserRound } from "lucide-react";

import { employeeSchema, type EmployeeFormValues } from "@/lib/schemas";

import { employeeApi } from "@/lib/api";
import type { Department, Employee } from "@/lib/types";

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

import { extractErrorMessage } from "@/lib/errors";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "../ui/toast";

const DEFAULT_AVATAR = "/default-avatar.svg";

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

  const queryClient = useQueryClient();

  const isEditing = Boolean(employee);

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

  const saveEmployeeMutation = useMutation({
    mutationFn: async (values: EmployeeFormValues) => {
      let savedEmployee: Employee;

      if (employee) {
        const { data } = await employeeApi.update(employee.id, {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
        });

        savedEmployee = data;
      } else {
        const { data } = await employeeApi.create({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
        });

        savedEmployee = data;
      }

      if (values.departmentId) {
        await employeeApi.assignDepartment(
          savedEmployee.id,
          Number(values.departmentId),
        );
      }

      if (imageFile) {
        await employeeApi.uploadProfileImage(savedEmployee.id, imageFile);
      }

      return savedEmployee;
    },

    onSuccess: () => {
      toast.add({
        title: isEditing ? "Employee updated" : "Employee created",
        description: isEditing
          ? "The employee information was updated successfully."
          : "The employee was added successfully.",
        type: "success",
      });

      queryClient.invalidateQueries({
        queryKey: ["employees"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });

      onSaved();
      onClose();
    },

    onError: (error) => {
      toast.add({
        title: isEditing
          ? "Failed to update employee"
          : "Failed to create employee",
        type: "error",
      });

      setServerError(extractErrorMessage(error, "Failed to save employee."));
    },
  });

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function onSubmit(values: EmployeeFormValues) {
    setServerError("");
    saveEmployeeMutation.mutate(values);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Profile image */}
      <section className="rounded-xl border border-border bg-muted/30 p-4 sm:p-5">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="relative shrink-0">
            <div className="flex size-20 items-center justify-center overflow-hidden rounded-full border border-border bg-muted shadow-sm sm:size-24">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayUrl}
                alt={
                  employee
                    ? `${employee.firstName} ${employee.lastName}`
                    : "Employee profile"
                }
                className="size-full object-cover"
              />
            </div>

            {!previewUrl && !savedBlobUrl && (
              <div className="absolute bottom-0 right-0 flex size-7 items-center justify-center rounded-full border-2 border-background bg-muted text-muted-foreground">
                <UserRound className="size-3.5" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-sm font-medium">Profile photo</p>

            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Upload a JPG, PNG, or WebP image for the employee profile.
            </p>

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
              className="mt-3"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting}
            >
              <Upload className="size-4" />
              {savedBlobUrl || imageFile ? "Change photo" : "Upload photo"}
            </Button>
          </div>
        </div>
      </section>

      {/* Personal information */}
      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold">Personal information</h3>

          <p className="mt-1 text-xs text-muted-foreground">
            Basic information used for the employee record.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* First name */}
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>

            <Input
              id="firstName"
              placeholder="John"
              aria-invalid={Boolean(errors.firstName)}
              className={
                errors.firstName
                  ? "border-destructive focus-visible:ring-destructive"
                  : undefined
              }
              {...register("firstName")}
            />

            {errors.firstName && (
              <p className="text-xs text-destructive">
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Last name */}
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>

            <Input
              id="lastName"
              placeholder="Doe"
              aria-invalid={Boolean(errors.lastName)}
              className={
                errors.lastName
                  ? "border-destructive focus-visible:ring-destructive"
                  : undefined
              }
              {...register("lastName")}
            />

            {errors.lastName && (
              <p className="text-xs text-destructive">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>

          <Input
            id="email"
            type="email"
            placeholder="john.doe@example.com"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            className={
              errors.email
                ? "border-destructive focus-visible:ring-destructive"
                : undefined
            }
            {...register("email")}
          />

          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Department */}
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>

          <Controller
            name="departmentId"
            control={control}
            render={({ field }) => {
              const selectedDepartment = departments.find(
                (department) => department.id.toString() === field.value,
              );

              return (
                <Select
                  value={field.value ?? ""}
                  onValueChange={(value) => field.onChange(value || null)}
                >
                  <SelectTrigger id="department" className="w-full">
                    <SelectValue placeholder="Select a department">
                      {selectedDepartment?.name ?? "Select a department"}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {departments.length === 0 ? (
                      <SelectItem value="__empty__" disabled>
                        No departments available
                      </SelectItem>
                    ) : (
                      departments.map((department) => (
                        <SelectItem
                          key={department.id}
                          value={department.id.toString()}
                        >
                          {department.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              );
            }}
          />

          <p className="text-xs text-muted-foreground">
            You can assign the employee to a department.
          </p>
        </div>
      </section>

      {/* Server error */}
      {serverError && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          {serverError}
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}

          {isSubmitting
            ? "Saving..."
            : isEditing
              ? "Save changes"
              : "Create employee"}
        </Button>
      </div>
    </form>
  );
}

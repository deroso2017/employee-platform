"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  KeyRound,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { authApi, employeeApi } from "@/lib/api";
import { ProfileCard } from "./ProfileCard";
import { Employee, UserProfile } from "@/lib/types";
import { ProfileLoading } from "./ProfileLoading";
import { ProfileError } from "./ProfileError";
import { ChangePasswordDialog } from "./ChangePasswordDialog";
import { useProfileImage } from "@/lib/hooks/useProfileImage";

const DEFAULT_AVATAR = "/default-avatar.svg";

async function getCurrentProfile(): Promise<UserProfile> {
  const response = await authApi.profile();
  return response.data as UserProfile;
}

function EmployeeAvatar({ employee }: { employee: Employee }) {
  const apiSrc = employee.profileImage
    ? employeeApi.profileImageUrl(employee.id)
    : null;

  const blobUrl = useProfileImage(apiSrc);
  const src = blobUrl ?? DEFAULT_AVATAR;

  return (
    <div className="size-20 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`${employee.firstName} ${employee.lastName}`}
        className="size-full object-cover"
      />
    </div>
  );
}

export default function Profile() {
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const profileQuery = useQuery({
    queryKey: ["profile", "me"],
    queryFn: getCurrentProfile,
    staleTime: 60_000,
    retry: 1,
  });

  const profile = profileQuery.data;
  const employee = profile?.employee;

  if (profileQuery.isLoading) {
    return <ProfileLoading />;
  }

  if (profileQuery.isError || !profile) {
    return (
      <ProfileError
        onRetry={() => {
          void profileQuery.refetch();
        }}
      />
    );
  }

  const employeeName = employee
    ? `${employee.firstName} ${employee.lastName}`.trim()
    : null;

  const initials = employee
    ? `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`.toUpperCase()
    : profile.email.charAt(0).toUpperCase();

  return (
    <div className="space-y-6">
      {/* Account identity */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="h-24 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent sm:h-32" />

        <div className="px-5 pb-6 sm:px-7">
          <div className="-mt-10 flex items-end gap-4 sm:-mt-12">
            {employee && employee.profileImage ? (
              <EmployeeAvatar employee={employee} />
            ) : (
              <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl border-4 border-card bg-primary text-xl font-semibold text-primary-foreground shadow-sm sm:size-24">
                {initials}
              </div>
            )}

            <div className="min-w-0 pb-1">
              <h2 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
                {employeeName || "Account"}
              </h2>

              <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="size-4 shrink-0" />
                <span className="truncate">{profile.email}</span>
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
              <ShieldCheck className="size-3.5" />
              User account
            </span>

            {employee && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-xs font-medium text-success">
                <CheckCircle2 className="size-3.5" />
                Linked employee
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Employee details only when linked */}
      {employee && (
        <section className="rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <BriefcaseBusiness className="size-4" />
              </div>

              <div>
                <h2 className="font-semibold">Employee information</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Details from your linked employee record.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
            <ProfileCard
              label="Full name"
              value={employeeName}
              icon={UserRound}
            />

            <ProfileCard
              label="Job title"
              value={employee.jobTitle}
              icon={BriefcaseBusiness}
            />

            <ProfileCard
              label="Department"
              value={employee.department}
              icon={Building2}
            />

            <ProfileCard
              label="Phone number"
              value={employee.phone}
              icon={Phone}
            />

            {employee.employeeNumber && (
              <ProfileCard
                label="Employee number"
                value={employee.employeeNumber}
                icon={ShieldCheck}
              />
            )}
          </div>
        </section>
      )}

      {/* Security / Password section */}
      <section className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <KeyRound className="size-4" />
          </div>
          <div>
            <h2 className="font-semibold">Security</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your password and account security settings.
            </p>
          </div>
        </div>

        <Button variant="outline" onClick={() => setPasswordDialogOpen(true)}>
          <KeyRound className="mr-2 size-4" />
          Change password
        </Button>
      </section>

      {/* Password Dialog Component */}
      <ChangePasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
      />
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { employeeApi, departmentApi } from "@/lib/api";
import type { Employee, Department } from "@/lib/types";
import { useProfileImage } from "@/lib/hooks/useProfileImage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  employee?: Employee | null;
}

const DEFAULT_AVATAR = "/default-avatar.svg";

interface EmployeeFormProps {
  employee: Employee | null | undefined;
  departments: Department[];
  onClose: () => void;
  onSaved: () => void;
}

function EmployeeForm({
  employee,
  departments,
  onClose,
  onSaved,
}: EmployeeFormProps) {
  const [firstName, setFirstName] = useState(employee?.firstName ?? "");
  const [lastName, setLastName] = useState(employee?.lastName ?? "");
  const [email, setEmail] = useState(employee?.email ?? "");
  const [departmentId, setDepartmentId] = useState(
    employee?.department?.id?.toString() ?? "",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const savedImageApiUrl = employee?.profileImage
    ? employeeApi.profileImageUrl(employee.id)
    : null;
  const savedBlobUrl = useProfileImage(savedImageApiUrl);

  const displayUrl = previewUrl ?? savedBlobUrl ?? DEFAULT_AVATAR;

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      let savedEmployee: Employee;

      if (employee) {
        const { data } = await employeeApi.update(employee.id, {
          firstName,
          lastName,
          email,
        });
        savedEmployee = data;
        if (departmentId) {
          await employeeApi.assignDepartment(employee.id, Number(departmentId));
        }
      } else {
        const { data } = await employeeApi.create({
          firstName,
          lastName,
          email,
        });
        savedEmployee = data;
      }

      if (imageFile) {
        await employeeApi.uploadProfileImage(savedEmployee.id, imageFile);
      }

      onSaved();
      onClose();
    } catch {
      setError("Failed to save employee.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
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
        <Label>First Name</Label>
        <Input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1">
        <Label>Last Name</Label>
        <Input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1">
        <Label>Email</Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      {employee && (
        <div className="space-y-1">
          <Label>Department</Label>
          <Select
            value={departmentId}
            onValueChange={(val) => setDepartmentId(val ?? "")}
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
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Outer shell — manages open state and fetches departments once when opened.
// Passes a `key` to EmployeeForm so it fully remounts on each open/employee
// change, giving fresh initial state without any reset effects.
// ---------------------------------------------------------------------------
export default function EmployeeFormDialog({
  open,
  onClose,
  onSaved,
  employee,
}: Props) {
  const [departments, setDepartments] = useState<Department[]>([]);

  // Fetch departments when the dialog opens — this is a legitimate effect:
  // it subscribes to an external system (the API) and calls setState in the
  // async callback, not synchronously in the effect body.
  useEffect(() => {
    if (!open) return;
    departmentApi.getAll().then(({ data }) => setDepartments(data));
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {employee ? "Edit Employee" : "New Employee"}
          </DialogTitle>
        </DialogHeader>
        {open && (
          <EmployeeForm
            key={`${employee?.id ?? "new"}-${open}`}
            employee={employee}
            departments={departments}
            onClose={onClose}
            onSaved={onSaved}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

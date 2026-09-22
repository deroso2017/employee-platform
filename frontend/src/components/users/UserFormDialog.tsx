"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { UserForm } from "@/components/users/UserForm";
import type { User } from "@/lib/types";

interface UserFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  user?: User | null;
}

export default function UserFormDialog({
  open,
  onClose,
  onSaved,
  user,
}: UserFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{user ? "Edit user" : "Create user"}</DialogTitle>
        </DialogHeader>

        {open && (
          <UserForm
            key={`${user?.id ?? "new"}-${open}`}
            user={user}
            onClose={onClose}
            onSaved={onSaved}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

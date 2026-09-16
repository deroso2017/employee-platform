"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserForm } from "./UserForm";
import { User } from "@/lib/types";

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "New User"}</DialogTitle>
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

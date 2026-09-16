"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { teamApi } from "@/lib/api";
import type { Team } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { extractErrorMessage } from "@/lib/errors";

interface TeamFormDialogProps {
  open: boolean;
  onClose: () => void;
  team: Team | null;
  onSaved: () => void;
}

export default function TeamFormDialog({
  open,
  onClose,
  team,
  onSaved,
}: TeamFormDialogProps) {
  const isEditing = team !== null;

  // Initialize state directly from props without useEffect
  const [name, setName] = useState(team?.name ?? "");

  const mutation = useMutation({
    mutationFn: async () => {
      const trimmedName = name.trim();

      if (!trimmedName) {
        throw new Error("Team name is required");
      }

      if (isEditing) {
        return teamApi.update(team.id, {
          name: trimmedName,
        });
      }

      return teamApi.create({
        name: trimmedName,
      });
    },

    onSuccess: () => {
      toast.add({
        title: isEditing ? "Team updated" : "Team created",
        type: "success",
      });

      onSaved();
      onClose();
    },

    onError: (error) => {
      toast.add({
        title: isEditing ? "Failed to update team" : "Failed to create team",
        description: extractErrorMessage(error),
        type: "error",
      });
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      toast.add({
        title: "Team name is required",
        type: "error",
      });

      return;
    }

    mutation.mutate();
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            {isEditing ? "Edit Team" : "Add Team"}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {isEditing ? "Update the team name." : "Create a new team."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="team-name" className="text-sm font-medium">
              Team name
            </label>

            <Input
              id="team-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Development"
              maxLength={255}
              autoFocus
              disabled={mutation.isPending}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={mutation.isPending || !name.trim()}>
              {mutation.isPending
                ? "Saving..."
                : isEditing
                  ? "Save changes"
                  : "Create team"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

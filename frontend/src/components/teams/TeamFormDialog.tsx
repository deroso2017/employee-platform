"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Users } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { teamApi } from "@/lib/api";
import type { Team } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { extractErrorMessage } from "@/lib/errors";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TeamFormDialogProps {
  open: boolean;
  onClose: () => void;
  team: Team | null;
  onSaved: () => void;
}

interface TeamFormValues {
  name: string;
}

export default function TeamFormDialog({
  open,
  onClose,
  team,
  onSaved,
}: TeamFormDialogProps) {
  const queryClient = useQueryClient();

  const isEditing = Boolean(team);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TeamFormValues>({
    defaultValues: {
      name: team?.name ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: team?.name ?? "",
      });
    }
  }, [open, team, reset]);

  const mutation = useMutation({
    mutationFn: async (values: TeamFormValues) => {
      const name = values.name.trim();

      if (isEditing && team) {
        return teamApi.update(team.id, {
          name,
        });
      }

      return teamApi.create({
        name,
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["teams"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });

      toast.add({
        title: isEditing ? "Team updated" : "Team created",
        description: isEditing
          ? "The team was updated successfully."
          : "The team was created successfully.",
        type: "success",
      });

      onSaved();
      onClose();
    },

    onError: (error) => {
      toast.add({
        title: isEditing ? "Failed to update team" : "Failed to create team",
        description: extractErrorMessage(error, "Unable to save the team."),
        type: "error",
      });
    },
  });

  function onSubmit(values: TeamFormValues) {
    mutation.mutate(values);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value && !isSubmitting) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="size-5" />
            </div>

            <div>
              <DialogTitle>
                {isEditing ? "Edit team" : "Create team"}
              </DialogTitle>

              <DialogDescription className="mt-1">
                {isEditing
                  ? "Update the team name."
                  : "Create a new team for your organization."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="team-name">Team name</Label>

            <Input
              id="team-name"
              placeholder="e.g. Development"
              autoFocus
              maxLength={255}
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.name)}
              {...register("name", {
                required: "Team name is required.",
                validate: (value) =>
                  value.trim().length > 0 || "Team name is required.",
              })}
            />

            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <DialogFooter>
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
                  : "Create team"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

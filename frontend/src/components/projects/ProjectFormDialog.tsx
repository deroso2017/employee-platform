"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { projectApi, teamApi } from "@/lib/api";

import type { Project, ProjectStatus } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { extractErrorMessage } from "@/lib/errors";
import { Spinner } from "@/components/ui/spinner";

interface ProjectFormDialogProps {
  open: boolean;
  onClose: () => void;
  project: Project | null;
  onSaved: () => void;
}

const STATUS_OPTIONS: {
  value: ProjectStatus;
  label: string;
}[] = [
  {
    value: "PLANNED",
    label: "Planned",
  },
  {
    value: "ACTIVE",
    label: "Active",
  },
  {
    value: "COMPLETED",
    label: "Completed",
  },
  {
    value: "CANCELLED",
    label: "Cancelled",
  },
];

export default function ProjectFormDialog({
  open,
  onClose,
  project,
  onSaved,
}: ProjectFormDialogProps) {
  const isEditing = project !== null;

  // Initialize state directly from props instead of using useEffect
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [status, setStatus] = useState<ProjectStatus>(
    project?.status ?? "PLANNED",
  );
  const [teamId, setTeamId] = useState(
    project?.teamId ? String(project.teamId) : "",
  );

  const queryClient = useQueryClient();

  const { data: teams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ["teams"],
    enabled: open,
    queryFn: async () => {
      const response = await teamApi.getAll();
      return response.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const trimmedName = name.trim();
      const trimmedDescription = description.trim();

      if (!trimmedName) {
        throw new Error("Project name is required");
      }

      const selectedTeamId = Number(teamId);

      if (!selectedTeamId) {
        throw new Error("Please select a team");
      }

      const data = {
        name: trimmedName,
        description: trimmedDescription || undefined,
        status,
        teamId: selectedTeamId,
      };

      if (isEditing) {
        return projectApi.update(project.id, data);
      }

      return projectApi.create(data);
    },

    onSuccess: () => {
      toast.add({
        title: isEditing ? "Project updated" : "Project created",
        type: "success",
      });

      queryClient.invalidateQueries({
        queryKey: ["projects"],
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
          ? "Failed to update project"
          : "Failed to create project",
        description: extractErrorMessage(error),
        type: "error",
      });
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      toast.add({
        title: "Project name is required",
        type: "error",
      });

      return;
    }

    if (!teamId) {
      toast.add({
        title: "Please select a team",
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
      <div className="w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            {isEditing ? "Edit Project" : "Add Project"}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {isEditing
              ? "Update the project details."
              : "Create a new project."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="project-name" className="text-sm font-medium">
              Project name
            </label>

            <Input
              id="project-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Employee Platform"
              maxLength={255}
              autoFocus
              disabled={mutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="project-description"
              className="text-sm font-medium"
            >
              Description
            </label>

            <textarea
              id="project-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the project..."
              maxLength={2000}
              rows={4}
              disabled={mutation.isPending}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="project-team" className="text-sm font-medium">
              Team
            </label>

            <select
              id="project-team"
              value={teamId}
              onChange={(event) => setTeamId(event.target.value)}
              disabled={teamsLoading || mutation.isPending}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">
                {teamsLoading ? "Loading teams..." : "Select team..."}
              </option>

              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>

            {teamsLoading && <Spinner className="size-4" />}

            {!teamsLoading && teams.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Create a team before creating a project.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="project-status" className="text-sm font-medium">
              Status
            </label>

            <select
              id="project-status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as ProjectStatus)
              }
              disabled={mutation.isPending}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
            The project manager is automatically assigned from the currently
            authenticated manager account.
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

            <Button
              type="submit"
              disabled={
                mutation.isPending || teamsLoading || !name.trim() || !teamId
              }
            >
              {mutation.isPending
                ? "Saving..."
                : isEditing
                  ? "Save changes"
                  : "Create project"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

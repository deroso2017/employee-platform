"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderKanban, Users } from "lucide-react";

import { projectApi, teamApi } from "@/lib/api";
import type { Project, ProjectStatus } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !mutation.isPending) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-2xl overflow-hidden p-0">
        {/* Header */}
        <div className="border-b border-border px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <FolderKanban className="h-5 w-5 text-primary" />
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight">
                {isEditing ? "Edit project" : "Create project"}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {isEditing
                  ? "Update the project information and configuration."
                  : "Create a project and assign it to a team."}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 px-6 py-6">
            {/* Project details */}
            <section className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Project details
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  Basic information about the project.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-name">Project name</Label>

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
                <Label htmlFor="project-description">Description</Label>

                <textarea
                  id="project-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe the project..."
                  maxLength={2000}
                  rows={4}
                  disabled={mutation.isPending}
                  className="flex min-h-24 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none placeholder:text-muted-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />

                <div className="flex justify-end text-xs text-muted-foreground">
                  {description.length}/2000
                </div>
              </div>
            </section>

            {/* Configuration */}
            <section className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Configuration
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  Assign the project to a team and set its current status.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="project-team">Team</Label>

                  <Select
                    value={teamId}
                    onValueChange={(value) => {
                      setTeamId(value ?? "");
                    }}
                    disabled={teamsLoading || mutation.isPending}
                  >
                    <SelectTrigger id="project-team" className="w-full">
                      <SelectValue placeholder="Select team..." />
                    </SelectTrigger>

                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={String(team.id)}>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {team.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {teamsLoading && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Spinner className="size-3.5" />
                      Loading teams...
                    </div>
                  )}

                  {!teamsLoading && teams.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Create a team before creating a project.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project-status">Status</Label>

                  <Select
                    value={status}
                    onValueChange={(value) => {
                      if (value) {
                        setStatus(value as ProjectStatus);
                      }
                    }}
                    disabled={mutation.isPending}
                  >
                    <SelectTrigger id="project-status" className="w-full">
                      <SelectValue placeholder="Select status..." />
                    </SelectTrigger>

                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Manager information */}
            <div className="rounded-lg border border-primary/15 bg-primary/5 px-4 py-3">
              <div className="flex gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <FolderKanban className="h-4 w-4 text-primary" />
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground">
                    Project manager
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    The project manager is automatically assigned from the
                    currently authenticated manager account.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-2 border-t border-border bg-muted/20 px-6 py-4 sm:flex-row sm:justify-end">
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
      </DialogContent>
    </Dialog>
  );
}

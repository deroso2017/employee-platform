"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, UserPlus, Users, Trash2 } from "lucide-react";

import { teamApi } from "@/lib/api";
import type { Team } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/toast";

import { extractErrorMessage } from "@/lib/errors";

interface TeamsProps {
  onEdit: (team: Team) => void;
  onAdd: () => void;
  onMembers: (team: Team) => void;
  canManage: boolean;
}

export function Teams({ onEdit, onAdd, onMembers, canManage }: TeamsProps) {
  const queryClient = useQueryClient();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const response = await teamApi.getAll();
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => teamApi.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["teams"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });

      setDeleteDialogOpen(false);
      setTeamToDelete(null);

      toast.add({
        title: "Team deleted",
        description: "The team was deleted successfully.",
        type: "success",
      });
    },

    onError: (error) => {
      toast.add({
        title: "Failed to delete team",
        description: extractErrorMessage(error, "Unable to delete the team."),
        type: "error",
      });
    },
  });

  function handleDelete(team: Team) {
    setTeamToDelete(team);
    setDeleteDialogOpen(true);
  }

  function confirmDelete() {
    if (!teamToDelete) {
      return;
    }

    deleteMutation.mutate(teamToDelete.id);
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="rounded-xl border-border shadow-sm">
            <CardContent className="p-5">
              <div className="animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-muted" />

                  <div className="flex-1">
                    <div className="h-4 w-32 rounded bg-muted" />
                    <div className="mt-2 h-3 w-20 rounded bg-muted" />
                  </div>
                </div>

                <div className="mt-5 h-8 rounded bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <>
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
            <Users className="size-6 text-muted-foreground" />
          </div>

          <h3 className="font-medium">No teams yet</h3>

          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {canManage
              ? "Create your first team to start organizing employees."
              : "There are currently no teams available."}
          </p>

          {canManage && (
            <Button className="mt-5" onClick={onAdd}>
              <Plus className="size-4" />
              Add team
            </Button>
          )}
        </div>

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete team?"
          description={
            teamToDelete
              ? `Are you sure you want to delete ${teamToDelete.name}? This action cannot be undone.`
              : undefined
          }
          confirmLabel="Delete"
          cancelLabel="Cancel"
          loading={deleteMutation.isPending}
          onConfirm={confirmDelete}
        />
      </>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">All teams</h2>

          <p className="text-sm text-muted-foreground">
            {teams.length} {teams.length === 1 ? "team" : "teams"}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <Card
            key={team.id}
            className="group rounded-xl border-border shadow-sm transition-shadow hover:shadow-md"
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Users className="size-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{team.name}</p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {team.memberCount}{" "}
                    {team.memberCount === 1 ? "member" : "members"}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => onMembers(team)}
                >
                  <UserPlus className="size-4" />
                  Members
                </Button>

                {canManage && (
                  <>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8 text-muted-foreground hover:text-foreground"
                      onClick={() => onEdit(team)}
                      aria-label={`Edit ${team.name}`}
                    >
                      <Pencil className="size-4" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(team)}
                      disabled={deleteMutation.isPending}
                      aria-label={`Delete ${team.name}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete team?"
        description={
          teamToDelete
            ? `Are you sure you want to delete ${teamToDelete.name}? This action cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleteMutation.isPending}
        onConfirm={confirmDelete}
      />
    </>
  );
}

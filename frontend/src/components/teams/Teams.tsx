"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, UserPlus, Users, Trash2 } from "lucide-react";
import { teamApi } from "@/lib/api";
import type { Team } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/toast";
import { extractErrorMessage } from "@/lib/errors";
import TeamFormDialog from "./TeamFormDialog";
import TeamMembersDialog from "./TeamMembersDialog";
import { TeamsSkeleton } from "./TeamsSkeleton";
import { EmptyTeamsState } from "./EmptyTeamsState";

interface TeamsProps {
  canManage: boolean;
}

export function Teams({ canManage }: TeamsProps) {
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);

  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const response = await teamApi.getAll();
      return response.data;
    },
  });

  // Listen to external "Add team" click from PageHeader
  useEffect(() => {
    function handleOpenAdd() {
      openCreate();
    }
    window.addEventListener("open-add-team", handleOpenAdd);
    return () => window.removeEventListener("open-add-team", handleOpenAdd);
  }, []);

  function openCreate() {
    setEditingTeam(null);
    setFormDialogOpen(true);
  }

  function openEdit(team: Team) {
    setEditingTeam(team);
    setFormDialogOpen(true);
  }

  const deleteMutation = useMutation({
    mutationFn: (id: number) => teamApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
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
    if (!teamToDelete) return;
    deleteMutation.mutate(teamToDelete.id);
  }

  function openMembers(team: Team) {
    setSelectedTeam(team);
    setMembersDialogOpen(true);
  }

  function closeMembers() {
    setMembersDialogOpen(false);
    setSelectedTeam(null);
  }

  if (isLoading) {
    return <TeamsSkeleton />;
  }

  if (teams.length === 0) {
    return (
      <EmptyTeamsState
        canManage={canManage}
        onAdd={openCreate}
        formDialogOpen={formDialogOpen}
        setFormDialogOpen={setFormDialogOpen}
        editingTeam={editingTeam}
      />
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
                  onClick={() => openMembers(team)}
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
                      onClick={() => openEdit(team)}
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

      <TeamFormDialog
        key={editingTeam?.id ?? "create"}
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        team={editingTeam}
        onSaved={() => {}}
      />

      {selectedTeam && (
        <TeamMembersDialog
          open={membersDialogOpen}
          onClose={closeMembers}
          team={selectedTeam}
          canManage={canManage}
          onChanged={() => {}}
        />
      )}
    </>
  );
}

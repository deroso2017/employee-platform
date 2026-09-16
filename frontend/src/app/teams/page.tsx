"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Users, UserPlus } from "lucide-react";

import { teamApi } from "@/lib/api";
import type { Team } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import TeamFormDialog from "@/components/teams/TeamFormDialog";
import TeamMembersDialog from "@/components/teams/TeamMembersDialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { extractErrorMessage } from "@/lib/errors";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function TeamsPage() {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);

  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);

  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ["teams"],
    enabled: !loading,
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

      setDeleteDialogOpen(false);
      setTeamToDelete(null);

      toast.add({
        title: "Team deleted",
        type: "success",
      });
    },

    onError: (error) => {
      toast.add({
        title: "Failed to delete team",
        description: extractErrorMessage(error),
        type: "error",
      });
    },
  });

  function openCreate() {
    setEditingTeam(null);
    setFormDialogOpen(true);
  }

  function openEdit(team: Team) {
    setEditingTeam(team);
    setFormDialogOpen(true);
  }

  function openMembers(team: Team) {
    setSelectedTeam(team);
    setMembersDialogOpen(true);
  }

  function openDelete(team: Team) {
    setTeamToDelete(team);
    setDeleteDialogOpen(true);
  }

  function confirmDelete() {
    if (!teamToDelete) {
      return;
    }

    deleteMutation.mutate(teamToDelete.id);
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Teams</h1>

          {canManage && (
            <Button onClick={openCreate}>
              <Users className="mr-2 h-4 w-4" />
              Add Team
            </Button>
          )}
        </div>

        <div className="rounded-lg border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team</TableHead>
                <TableHead>Members</TableHead>
                <TableHead className="w-56">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-8">
                    <div className="flex items-center justify-center">
                      <Spinner className="size-7" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : teams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Users className="h-6 w-6 text-muted-foreground" />
                      </div>

                      <h3 className="font-medium">No teams found</h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        There are currently no teams to display.
                      </p>

                      {canManage && (
                        <Button className="mt-4" onClick={openCreate}>
                          <Users className="mr-2 h-4 w-4" />
                          Add Team
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                          <Users className="h-4 w-4 text-muted-foreground" />
                        </div>

                        <span className="font-medium">{team.name}</span>
                      </div>
                    </TableCell>

                    <TableCell>{team.memberCount}</TableCell>

                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openMembers(team)}
                        >
                          <UserPlus className="mr-1.5 h-4 w-4" />
                          Members
                        </Button>

                        {canManage && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEdit(team)}
                            >
                              Edit
                            </Button>

                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openDelete(team)}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>

      <TeamFormDialog
        key={editingTeam?.id ?? "create"}
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        team={editingTeam}
        onSaved={() => {
          queryClient.invalidateQueries({
            queryKey: ["teams"],
          });
        }}
      />

      {selectedTeam && (
        <TeamMembersDialog
          open={membersDialogOpen}
          onClose={() => {
            setMembersDialogOpen(false);
            setSelectedTeam(null);
          }}
          team={selectedTeam}
          canManage={canManage}
          onChanged={() => {
            queryClient.invalidateQueries({
              queryKey: ["teams"],
            });
          }}
        />
      )}

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
    </div>
  );
}

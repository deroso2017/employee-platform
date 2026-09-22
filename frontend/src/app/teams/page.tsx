"use client";

import { useState } from "react";

import Navbar from "@/components/layout/Navbar";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/context/AuthContext";
import type { Team } from "@/lib/types";

import TeamFormDialog from "@/components/teams/TeamFormDialog";
import TeamMembersDialog from "@/components/teams/TeamMembersDialog";
import { Teams } from "@/components/teams/Teams";
import { RefreshButton } from "@/components/ui/RefreshButton";

export default function TeamsPage() {
  const { user } = useAuth();

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);

  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";

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

  function closeMembers() {
    setMembersDialogOpen(false);
    setSelectedTeam(null);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <PageContainer>
        <PageHeader
          title="Teams"
          description="Organize employees into teams and manage team membership."
          actions={
            <div className="flex items-center gap-2">
              {canManage ? (
                <Button onClick={openCreate}>Add team</Button>
              ) : undefined}
              <RefreshButton queryKey="teams"></RefreshButton>
            </div>
          }
        />

        <Teams
          onEdit={openEdit}
          onAdd={openCreate}
          onMembers={openMembers}
          canManage={canManage}
        />
      </PageContainer>

      <TeamFormDialog
        key={editingTeam?.id ?? "create"}
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        team={editingTeam}
        onSaved={() => {
          // Teams handles its own query invalidation.
        }}
      />

      {selectedTeam && (
        <TeamMembersDialog
          open={membersDialogOpen}
          onClose={closeMembers}
          team={selectedTeam}
          canManage={canManage}
          onChanged={() => {
            // TeamMembersDialog invalidates the relevant queries.
          }}
        />
      )}
    </div>
  );
}

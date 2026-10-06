"use client";

import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import TeamFormDialog from "./TeamFormDialog";
import type { Team } from "@/lib/types";

interface EmptyTeamsStateProps {
  canManage: boolean;
  onAdd: () => void;
  formDialogOpen: boolean;
  setFormDialogOpen: (open: boolean) => void;
  editingTeam: Team | null;
}

export function EmptyTeamsState({
  canManage,
  onAdd,
  formDialogOpen,
  setFormDialogOpen,
  editingTeam,
}: EmptyTeamsStateProps) {
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

      {/* Dialogs */}
      <TeamFormDialog
        key={editingTeam?.id ?? "create"}
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        team={editingTeam}
        onSaved={() => {}}
      />
    </>
  );
}

"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { RefreshButton } from "@/components/ui/RefreshButton";
import { Teams } from "@/components/teams/Teams";

export default function TeamsPage() {
  const { user } = useAuth();
  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";

  return (
    <div className="min-h-screen bg-muted/20">
      <PageContainer>
        <PageHeader
          title="Teams"
          description="Organize employees into teams and manage team membership."
          actions={
            <div className="flex items-center gap-2">
              {canManage ? (
                // We pass an event or let Teams handle opening its own modal via a ref/callback if needed,
                // or keep a simple callback that triggers creation inside Teams.
                <Button
                  onClick={() =>
                    window.dispatchEvent(new CustomEvent("open-add-team"))
                  }
                >
                  Add team
                </Button>
              ) : undefined}
              <RefreshButton queryKey="teams" />
            </div>
          }
        />

        <Teams canManage={canManage} />
      </PageContainer>
    </div>
  );
}

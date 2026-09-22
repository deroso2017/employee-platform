"use client";

import Navbar from "@/components/layout/Navbar";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tasks } from "@/components/tasks/Tasks";
import { Button } from "@/components/ui/button";
import { RefreshButton } from "@/components/ui/RefreshButton";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function TasksPage() {
  const { user } = useAuth();

  const [createOpen, setCreateOpen] = useState(false);

  const canCreate = user?.role === "ADMIN" || user?.role === "MANAGER";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <PageContainer>
        <PageHeader
          title="Tasks"
          description="Manage project tasks, priorities, statuses, and assignments."
          actions={
            <div className="flex items-center gap-2">
              {canCreate ? (
                <Button onClick={() => setCreateOpen(true)}>Add task</Button>
              ) : undefined}
              <RefreshButton queryKey="tasks"></RefreshButton>
            </div>
          }
        />

        <Tasks createOpen={createOpen} onCreateOpenChange={setCreateOpen} />
      </PageContainer>
    </div>
  );
}

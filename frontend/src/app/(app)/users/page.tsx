"use client";

import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Users } from "@/components/users/Users";
import { RefreshButton } from "@/components/ui/RefreshButton";

export default function UsersPage() {
  const { user } = useAuth();

  const [createOpen, setCreateOpen] = useState(false);

  const canCreate = user?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-muted/20">
      <PageContainer>
        <PageHeader
          title="Users"
          description="Manage user accounts, roles, and application access."
          actions={
            <div className="flex items-center gap-2">
              {canCreate ? (
                <Button onClick={() => setCreateOpen(true)}>Add user</Button>
              ) : undefined}
              <RefreshButton queryKey="users" />
            </div>
          }
        />

        <Users createOpen={createOpen} onCreateOpenChange={setCreateOpen} />
      </PageContainer>
    </div>
  );
}

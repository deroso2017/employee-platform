"use client";

import { useState } from "react";

import Navbar from "@/components/layout/Navbar";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Users } from "@/components/users/Users";

export default function UsersPage() {
  const { user } = useAuth();

  const [createOpen, setCreateOpen] = useState(false);

  const canCreate = user?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <PageContainer>
        <PageHeader
          title="Users"
          description="Manage user accounts, roles, and application access."
          actions={
            canCreate ? (
              <Button onClick={() => setCreateOpen(true)}>Add user</Button>
            ) : undefined
          }
        />

        <Users createOpen={createOpen} onCreateOpenChange={setCreateOpen} />
      </PageContainer>
    </div>
  );
}

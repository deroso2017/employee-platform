"use client";

import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { RefreshButton } from "@/components/ui/RefreshButton";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />

      <PageContainer>
        <PageHeader
          title={`Welcome back${user?.email ? `, ${user.email}` : ""}`}
          description="Here's an overview of your organization and current work."
          actions={<RefreshButton queryKey="dashboard"></RefreshButton>}
        />

        <Dashboard userEmail={user?.email} />
      </PageContainer>
    </div>
  );
}

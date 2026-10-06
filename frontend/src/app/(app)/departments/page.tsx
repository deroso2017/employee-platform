"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Departments } from "@/components/departments/Departments";
import { RefreshButton } from "@/components/ui/RefreshButton";

export default function DepartmentsPage() {
  return (
    <div className="min-h-screen bg-muted/20">
      <PageContainer>
        <PageHeader
          title="Departments"
          description="Create and manage the departments in your organization."
          actions={<RefreshButton queryKey="departments"></RefreshButton>}
        />

        <Departments />
      </PageContainer>
    </div>
  );
}

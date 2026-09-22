"use client";

import Navbar from "@/components/layout/Navbar";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Projects } from "@/components/projects/Projects";
import { RefreshButton } from "@/components/ui/RefreshButton";

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <PageContainer>
        <PageHeader
          title="Projects"
          description="Manage company projects, teams, managers, and project status."
          actions={<RefreshButton queryKey="projects"></RefreshButton>}
        />

        <Projects />
      </PageContainer>
    </div>
  );
}

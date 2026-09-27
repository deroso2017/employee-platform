"use client";

import { useParams } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import { PageContainer } from "@/components/layout/PageContainer";
import ProjectDetail from "@/components/projects/ProjectDetail";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const projectId = Number(params.id);

  if (!Number.isInteger(projectId) || projectId <= 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <PageContainer>
          <p className="text-sm text-muted-foreground">Invalid project ID.</p>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageContainer>
        <ProjectDetail projectId={projectId} />
      </PageContainer>
    </div>
  );
}

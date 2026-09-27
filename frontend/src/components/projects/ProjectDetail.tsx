"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  CircleAlert,
  FolderKanban,
  RefreshCw,
  User,
  Users,
} from "lucide-react";

import { projectApi } from "@/lib/api";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";

interface ProjectDetailProps {
  projectId: number;
}

const statusStyles: Record<string, string> = {
  PLANNING: "bg-info/10 text-info",
  ACTIVE: "bg-success/10 text-success",
  ON_HOLD: "bg-warning/10 text-warning",
  COMPLETED: "bg-muted text-muted-foreground",
  CANCELLED: "bg-destructive/10 text-destructive",
};

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function ProjectStatus({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1",
        "text-xs font-medium",
        statusStyles[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {formatStatus(status)}
    </span>
  );
}

function ProjectDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-5 w-36 animate-pulse rounded bg-muted" />
      <div className="h-40 animate-pulse rounded-2xl border border-border bg-card" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-28 animate-pulse rounded-2xl border border-border bg-card" />
        <div className="h-28 animate-pulse rounded-2xl border border-border bg-card" />
      </div>
      <div className="h-64 animate-pulse rounded-2xl border border-border bg-card" />
    </div>
  );
}

function ProjectMessage({
  title,
  description,
  onRetry,
}: {
  title: string;
  description: string;
  onRetry?: () => void;
}) {
  const router = useRouter();

  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
        <CircleAlert className="size-5 text-muted-foreground" />
      </div>

      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            <RefreshCw className="mr-2 size-4" />
            Try again
          </Button>
        )}

        <Button variant="outline" onClick={() => router.push("/projects")}>
          <ArrowLeft className="mr-2 size-4" />
          Back to projects
        </Button>
      </div>
    </div>
  );
}

export default function ProjectDetail({ projectId }: ProjectDetailProps) {
  const router = useRouter();

  const projectQuery = useQuery<Project>({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const response = await projectApi.getById(projectId);
      return response.data;
    },
  });

  const project = projectQuery.data;

  if (projectQuery.isLoading) {
    return <ProjectDetailSkeleton />;
  }

  if (projectQuery.isError) {
    return (
      <ProjectMessage
        title="Unable to load project"
        description="Something went wrong while loading this project."
        onRetry={() => {
          void projectQuery.refetch();
        }}
      />
    );
  }

  if (!project) {
    return (
      <ProjectMessage
        title="Project not found"
        description="This project may have been deleted or you may not have permission to view it."
      />
    );
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 text-muted-foreground"
        onClick={() => router.push("/projects")}
      >
        <ArrowLeft className="mr-2 size-4" />
        Back to projects
      </Button>

      <PageHeader
        title={project.name}
        description="Project overview and activity"
        actions={<ProjectStatus status={String(project.status)} />}
      />

      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-background/80 text-primary shadow-sm">
              <FolderKanban className="size-6" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Project overview
              </p>

              <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                {project.description?.trim() ||
                  "No project description has been added yet."}
              </p>
            </div>
          </div>
        </div>

        <div className="grid divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <div className="flex items-center gap-3 p-5 sm:p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Users className="size-4" />
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Project team</p>
              <p className="mt-1 truncate text-sm font-medium">
                {project.teamName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-5 sm:p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <User className="size-4" />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Project manager</p>
              <p className="mt-1 truncate text-sm font-medium">
                {project.managerName}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="text-base font-semibold">Project tasks</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tasks associated with this project.
            </p>
          </div>

          <Button variant="outline" onClick={() => router.push("/tasks")}>
            View tasks
          </Button>
        </div>

        <div className="flex min-h-32 items-center justify-center px-5 py-8 text-center">
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            Task details can be displayed here once the project task API
            response is connected.
          </p>
        </div>
      </section>
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BriefcaseBusiness,
  Building2,
  FolderKanban,
  Users,
} from "lucide-react";

import { dashboardApi } from "@/lib/api";

import { DashboardKpiCard } from "@/components/dashboard/DashboardKpiCard";
import { ProjectOverview } from "@/components/dashboard/ProjectOverview";
import { TaskOverview } from "@/components/dashboard/TaskOverview";
import { MyTasks } from "@/components/dashboard/MyTasks";
import { RecentProjects } from "@/components/dashboard/RecentProjects";

interface DashboardProps {
  userEmail?: string;
}

export function Dashboard({ userEmail }: DashboardProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const response = await dashboardApi.get();
      return response.data;
    },
    staleTime: 30_000,
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Unable to load dashboard</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* KPI cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardKpiCard
          title="Employees"
          value={data.overview.employees}
          description="Active employees"
          icon={Users}
        />

        <DashboardKpiCard
          title="Departments"
          value={data.overview.departments}
          description="Organization units"
          icon={Building2}
        />

        <DashboardKpiCard
          title="Teams"
          value={data.overview.teams}
          description="Active teams"
          icon={BriefcaseBusiness}
        />

        <DashboardKpiCard
          title="Projects"
          value={data.overview.projects}
          description={`${data.projects.byStatus.ACTIVE ?? 0} currently active`}
          icon={FolderKanban}
        />
      </section>

      {/* Analytics */}
      <section className="grid gap-4 lg:grid-cols-2">
        <ProjectOverview data={data.projects} />

        <TaskOverview data={data.tasks} />
      </section>

      {/* Work */}
      <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <RecentProjects projects={data.recentProjects} />

        <MyTasks tasks={data.myTasks} />
      </section>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-xl border bg-muted/40"
          />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="h-80 animate-pulse rounded-xl border bg-muted/40" />
        <div className="h-80 animate-pulse rounded-xl border bg-muted/40" />
      </section>
    </div>
  );
}

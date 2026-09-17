"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BriefcaseBusiness,
  Building2,
  FolderKanban,
  Users,
} from "lucide-react";

import { dashboardApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

import { DashboardKpiCard } from "@/components/dashboard/DashboardKpiCard";
import { ProjectOverview } from "@/components/dashboard/ProjectOverview";
import { TaskOverview } from "@/components/dashboard/TaskOverview";
import { MyTasks } from "@/components/dashboard/MyTasks";
import { RecentProjects } from "@/components/dashboard/RecentProjects";
import Navbar from "@/components/layout/Navbar";

export default function DashboardPage() {
  const { user } = useAuth();

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
      <div className="flex min-h-[400px] items-center justify-center">
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
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      <main className="space-y-8 p-6">
        {/* Header */}
        <section>
          <p className="text-sm font-medium text-muted-foreground">Dashboard</p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Welcome back
            {user?.email ? `, ${user.email}` : ""}
          </h1>

          <p className="mt-2 text-muted-foreground">
            Here&apos;s an overview of your organization and current work.
          </p>
        </section>

        {/* KPI cards */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardKpiCard
            title="Employees"
            value={data.overview.employees}
            subtitle="Total employees"
            icon={Users}
          />

          <DashboardKpiCard
            title="Departments"
            value={data.overview.departments}
            subtitle="Organization units"
            icon={Building2}
          />

          <DashboardKpiCard
            title="Teams"
            value={data.overview.teams}
            subtitle="Active teams"
            icon={BriefcaseBusiness}
          />

          <DashboardKpiCard
            title="Projects"
            value={data.overview.projects}
            subtitle={`${data.projects.byStatus.ACTIVE ?? 0} currently active`}
            icon={FolderKanban}
          />
        </section>

        {/* Analytics */}
        <section className="grid gap-6 lg:grid-cols-2">
          <ProjectOverview data={data.projects} />

          <TaskOverview data={data.tasks} />
        </section>

        {/* Work */}
        <section className="grid gap-6 lg:grid-cols-2">
          <RecentProjects projects={data.recentProjects} />

          <MyTasks tasks={data.myTasks} />
        </section>
      </main>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <main className="space-y-8 p-6">
      <section className="space-y-3">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-9 w-72 animate-pulse rounded bg-muted" />
        <div className="h-4 w-96 animate-pulse rounded bg-muted" />
      </section>

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
    </main>
  );
}

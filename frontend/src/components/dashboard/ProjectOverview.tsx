"use client";

import { FolderKanban } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardProjectOverview } from "@/lib/types";

interface ProjectOverviewProps {
  data: DashboardProjectOverview;
}

const projectStatuses = [
  {
    key: "ACTIVE",
    label: "Active",
  },
  {
    key: "PLANNED",
    label: "Planned",
  },
  {
    key: "COMPLETED",
    label: "Completed",
  },
  {
    key: "CANCELLED",
    label: "Cancelled",
  },
] as const;

export function ProjectOverview({ data }: ProjectOverviewProps) {
  const total = Object.values(data.byStatus).reduce(
    (sum, value) => sum + value,
    0,
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FolderKanban className="size-5 text-muted-foreground" />
          <CardTitle>Project Overview</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {projectStatuses.map((status) => {
          const value = data.byStatus[status.key] ?? 0;
          const percentage = total > 0 ? (value / total) * 100 : 0;

          return (
            <div key={status.key} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{status.label}</span>

                <span className="font-medium">{value}</span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-foreground/70 transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

"use client";

import { CheckSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardTaskOverview } from "@/lib/types";

interface TaskOverviewProps {
  data: DashboardTaskOverview;
}

const statuses = [
  ["TODO", "To do"],
  ["IN_PROGRESS", "In progress"],
  ["DONE", "Completed"],
  ["CANCELLED", "Cancelled"],
] as const;

const priorities = [
  ["URGENT", "Urgent"],
  ["HIGH", "High"],
  ["MEDIUM", "Medium"],
  ["LOW", "Low"],
] as const;

export function TaskOverview({ data }: TaskOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CheckSquare className="size-5 text-muted-foreground" />
          <CardTitle>Task Overview</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            Status
          </p>

          <div className="grid grid-cols-2 gap-3">
            {statuses.map(([key, label]) => (
              <div key={key} className="rounded-lg border bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">{label}</p>

                <p className="mt-1 text-2xl font-semibold">
                  {data.byStatus[key]}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            Priority
          </p>

          <div className="space-y-3">
            {priorities.map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm">{label}</span>

                <span className="text-sm font-semibold">
                  {data.byPriority[key]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

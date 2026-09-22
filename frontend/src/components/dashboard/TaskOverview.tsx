import { CheckSquare } from "lucide-react";

import type { DashboardTaskOverview } from "@/lib/types";

interface TaskOverviewProps {
  data: DashboardTaskOverview;
}

const statuses = [
  ["TODO", "To do"],
  ["IN_PROGRESS", "In progress"],
  ["DONE", "Done"],
  ["CANCELLED", "Cancelled"],
] as const;

const priorities = [
  ["LOW", "Low"],
  ["MEDIUM", "Medium"],
  ["HIGH", "High"],
  ["URGENT", "Urgent"],
] as const;

export function TaskOverview({ data }: TaskOverviewProps) {
  return (
    <section
      className="
        rounded-xl
        border border-border/80
        bg-card
        p-5
        shadow-sm
      "
    >
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <CheckSquare className="size-4" />
        </div>

        <div>
          <h2 className="font-semibold tracking-tight">Task overview</h2>

          <p className="text-xs text-muted-foreground">
            Status and priority distribution
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Status
          </p>

          <div className="space-y-3">
            {statuses.map(([key, label]) => (
              <div
                key={key}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground">{label}</span>

                <span className="font-medium">{data.byStatus[key] ?? 0}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Priority
          </p>

          <div className="space-y-3">
            {priorities.map(([key, label]) => (
              <div
                key={key}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground">{label}</span>

                <span className="font-medium">{data.byPriority[key] ?? 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

import { FolderKanban } from "lucide-react";

import type { DashboardProjectOverview } from "@/lib/types";

interface ProjectOverviewProps {
  data: DashboardProjectOverview;
}

const statuses = [
  {
    key: "PLANNED",
    label: "Planned",
    className: "bg-slate-400",
  },
  {
    key: "ACTIVE",
    label: "Active",
    className: "bg-primary",
  },
  {
    key: "COMPLETED",
    label: "Completed",
    className: "bg-success",
  },
  {
    key: "CANCELLED",
    label: "Cancelled",
    className: "bg-destructive",
  },
] as const;

export function ProjectOverview({ data }: ProjectOverviewProps) {
  const total = Object.values(data.byStatus).reduce(
    (sum, value) => sum + value,
    0,
  );

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
          <FolderKanban className="size-4" />
        </div>

        <div>
          <h2 className="font-semibold tracking-tight">Project overview</h2>

          <p className="text-xs text-muted-foreground">
            {total} total projects
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {statuses.map((status) => {
          const value = data.byStatus[status.key] ?? 0;
          const percentage =
            total === 0 ? 0 : Math.round((value / total) * 100);

          return (
            <div key={status.key}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`size-2 rounded-full ${status.className}`} />

                  <span className="text-muted-foreground">{status.label}</span>
                </div>

                <span className="font-medium">{value}</span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${status.className}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

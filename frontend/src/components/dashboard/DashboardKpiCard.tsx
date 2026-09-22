import type { LucideIcon } from "lucide-react";

interface DashboardKpiCardProps {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
}

export function DashboardKpiCard({
  title,
  value,
  description,
  icon: Icon,
}: DashboardKpiCardProps) {
  return (
    <article
      className="
        group rounded-xl
        border border-border/80
        bg-card p-5
        shadow-sm
        transition-all duration-200
        hover:-translate-y-0.5
        hover:shadow-md
      "
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-muted-foreground">
            {title}
          </p>

          <p className="mt-2 text-3xl font-semibold tracking-tight">
            {value.toLocaleString()}
          </p>

          <p className="mt-1 truncate text-xs text-muted-foreground">
            {description}
          </p>
        </div>

        <div
          className="
            flex size-10 shrink-0 items-center justify-center
            rounded-lg
            bg-primary/10
            text-primary
            transition-colors
            group-hover:bg-primary/15
          "
        >
          <Icon className="size-5" />
        </div>
      </div>
    </article>
  );
}

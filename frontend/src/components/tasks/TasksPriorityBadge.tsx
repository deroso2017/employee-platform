import type { TaskPriority } from "@/lib/types";

export function TasksPriorityBadge({ priority }: { priority: TaskPriority }) {
  const config: Record<TaskPriority, { label: string; className: string }> = {
    LOW: {
      label: "Low",
      className: "bg-muted text-muted-foreground",
    },
    MEDIUM: {
      label: "Medium",
      className: "bg-info/10 text-info",
    },
    HIGH: {
      label: "High",
      className: "bg-warning/10 text-warning",
    },
    URGENT: {
      label: "Urgent",
      className: "bg-destructive/10 text-destructive",
    },
  };

  const item = config[priority];

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${item.className}`}
    >
      {item.label}
    </span>
  );
}

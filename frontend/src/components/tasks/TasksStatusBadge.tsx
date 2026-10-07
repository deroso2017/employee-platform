import { TaskStatus } from "@/lib/types";

export function TasksStatusBadge({ status }: { status: TaskStatus }) {
  const config: Record<TaskStatus, { label: string; className: string }> = {
    TODO: {
      label: "To Do",
      className: "bg-muted text-muted-foreground",
    },
    IN_PROGRESS: {
      label: "In Progress",
      className: "bg-info/10 text-info",
    },
    DONE: {
      label: "Done",
      className: "bg-success/10 text-success",
    },
    CANCELLED: {
      label: "Cancelled",
      className: "bg-destructive/10 text-destructive",
    },
  };

  const item = config[status];

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${item.className}`}
    >
      {item.label}
    </span>
  );
}

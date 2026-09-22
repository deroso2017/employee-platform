import { ArrowUpRight, CheckSquare } from "lucide-react";
import Link from "next/link";

import type { Task } from "@/lib/types";

interface MyTasksProps {
  tasks: Task[];
}

const priorityStyles: Record<string, string> = {
  LOW: "text-muted-foreground",
  MEDIUM: "text-info",
  HIGH: "text-warning",
  URGENT: "text-destructive",
};

export function MyTasks({ tasks }: MyTasksProps) {
  return (
    <section
      className="
        overflow-hidden rounded-xl
        border border-border/80
        bg-card
        shadow-sm
      "
    >
      <div className="flex items-center justify-between border-b border-border/80 p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CheckSquare className="size-4" />
          </div>

          <div>
            <h2 className="font-semibold tracking-tight">My tasks</h2>

            <p className="text-xs text-muted-foreground">
              Your latest assignments
            </p>
          </div>
        </div>

        <Link
          href="/tasks"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          View all
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-sm text-muted-foreground">No assigned tasks.</p>
        </div>
      ) : (
        <div className="divide-y divide-border/70">
          {tasks.map((task) => (
            <Link
              key={task.id}
              href={`/tasks/${task.id}`}
              className="
                block px-5 py-4
                transition-colors
                hover:bg-muted/50
              "
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{task.title}</p>

                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {task.projectName}
                  </p>
                </div>

                <span
                  className={[
                    "shrink-0 text-[11px] font-semibold",
                    priorityStyles[task.priority],
                  ].join(" ")}
                >
                  {task.priority}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

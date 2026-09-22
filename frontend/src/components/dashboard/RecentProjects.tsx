import { ArrowUpRight, FolderKanban } from "lucide-react";
import Link from "next/link";

import type { Project } from "@/lib/types";

interface RecentProjectsProps {
  projects: Project[];
}

const statusStyles: Record<string, string> = {
  PLANNED: "bg-muted text-muted-foreground",
  ACTIVE: "bg-primary/10 text-primary",
  COMPLETED: "bg-success/10 text-success-foreground",
  CANCELLED: "bg-destructive/10 text-destructive",
};

export function RecentProjects({ projects }: RecentProjectsProps) {
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
            <FolderKanban className="size-4" />
          </div>

          <div>
            <h2 className="font-semibold tracking-tight">Recent projects</h2>

            <p className="text-xs text-muted-foreground">
              Latest project activity
            </p>
          </div>
        </div>

        <Link
          href="/projects"
          className="
            inline-flex items-center gap-1
            text-xs font-medium text-primary
            hover:underline
          "
        >
          View all
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-sm text-muted-foreground">No projects yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-border/70">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="
                flex items-center gap-4
                px-5 py-4
                transition-colors
                hover:bg-muted/50
              "
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{project.name}</p>

                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {project.teamName} · {project.managerName}
                </p>
              </div>

              <span
                className={[
                  "shrink-0 rounded-full px-2.5 py-1",
                  "text-[11px] font-medium",
                  statusStyles[project.status] ??
                    "bg-muted text-muted-foreground",
                ].join(" ")}
              >
                {project.status.replace("_", " ")}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

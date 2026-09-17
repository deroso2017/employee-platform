"use client";

import Link from "next/link";
import { ArrowRight, FolderKanban } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/lib/types";

interface RecentProjectsProps {
  projects: Project[];
}

export function RecentProjects({ projects }: RecentProjectsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderKanban className="size-5 text-muted-foreground" />
            <CardTitle>Recent Projects</CardTitle>
          </div>

          <Link
            href="/projects"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            View all
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </CardHeader>

      <CardContent>
        {projects.length === 0 ? (
          <div className="flex min-h-32 items-center justify-center text-sm text-muted-foreground">
            No projects available.
          </div>
        ) : (
          <div className="divide-y">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{project.name}</p>

                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {project.teamName} · {project.managerName}
                  </p>
                </div>

                <Badge variant="outline">{project.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight, CheckSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Task } from "@/lib/types";

interface MyTasksProps {
  tasks: Task[];
}

const priorityVariant = {
  LOW: "secondary",
  MEDIUM: "outline",
  HIGH: "default",
  URGENT: "destructive",
} as const;

export function MyTasks({ tasks }: MyTasksProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="size-5 text-muted-foreground" />
            <CardTitle>My Tasks</CardTitle>
          </div>

          <Link
            href="/tasks"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            View all
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </CardHeader>

      <CardContent>
        {tasks.length === 0 ? (
          <div className="flex min-h-32 items-center justify-center text-sm text-muted-foreground">
            No tasks assigned to you.
          </div>
        ) : (
          <div className="divide-y">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{task.title}</p>

                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {task.projectName}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={priorityVariant[task.priority]}>
                    {task.priority}
                  </Badge>

                  <Badge variant="outline">
                    {task.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

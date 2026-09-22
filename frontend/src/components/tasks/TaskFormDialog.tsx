"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckSquare, FolderKanban, UserRound } from "lucide-react";

import { employeeApi, taskApi, teamApi } from "@/lib/api";
import type {
  Employee,
  Project,
  Task,
  TaskPriority,
  TaskStatus,
} from "@/lib/types";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  task?: Task | null;
}

const statuses: {
  value: TaskStatus;
  label: string;
}[] = [
  {
    value: "TODO",
    label: "To Do",
  },
  {
    value: "IN_PROGRESS",
    label: "In Progress",
  },
  {
    value: "DONE",
    label: "Done",
  },
  {
    value: "CANCELLED",
    label: "Cancelled",
  },
];

const priorities: {
  value: TaskPriority;
  label: string;
}[] = [
  {
    value: "LOW",
    label: "Low",
  },
  {
    value: "MEDIUM",
    label: "Medium",
  },
  {
    value: "HIGH",
    label: "High",
  },
  {
    value: "URGENT",
    label: "Urgent",
  },
];

export function TaskFormDialog({
  open,
  onOpenChange,
  project,
  task,
}: TaskFormDialogProps) {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "TODO");
  const [priority, setPriority] = useState<TaskPriority>(
    task?.priority ?? "MEDIUM",
  );
  const [assigneeId, setAssigneeId] = useState<string>(
    task?.assigneeId?.toString() ?? "",
  );

  const { data: members = [], isLoading: membersLoading } = useQuery<
    Employee[]
  >({
    queryKey: ["project-team-members", project.teamId],
    queryFn: async () => {
      const response = await teamApi.getMembers(project.teamId);
      return response.data;
    },
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const trimmedTitle = title.trim();
      const trimmedDescription = description.trim();

      if (!trimmedTitle) {
        throw new Error("Task title is required");
      }

      const data = {
        title: trimmedTitle,
        description: trimmedDescription || undefined,
        status,
        priority,
        assigneeId: assigneeId ? Number(assigneeId) : null,
      };

      if (task) {
        return taskApi.update(task.id, data);
      }

      return taskApi.create(project.id, data);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["project-tasks", project.id],
      });

      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });

      toast.add({
        title: task ? "Task updated" : "Task created",
        description: task
          ? "The task was updated successfully."
          : "The task was created successfully.",
        type: "success",
      });

      onOpenChange(false);
    },

    onError: (error) => {
      toast.add({
        title: task ? "Failed to update task" : "Failed to create task",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
        type: "error",
      });
    },
  });

  const canSubmit =
    title.trim().length > 0 &&
    title.trim().length <= 255 &&
    !mutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !mutation.isPending) {
          onOpenChange(false);
        }
      }}
    >
      <DialogContent className="max-w-2xl overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <CheckSquare className="h-5 w-5 text-primary" />
            </div>

            <div className="min-w-0">
              <DialogTitle className="text-lg tracking-tight">
                {task ? "Edit task" : "Create task"}
              </DialogTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                {task
                  ? "Update the task details, status, priority, or assignee."
                  : "Create a new task for the selected project."}
              </p>
            </div>
          </div>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault();

            if (!canSubmit) {
              return;
            }

            mutation.mutate();
          }}
        >
          <div className="max-h-[70vh] space-y-6 overflow-y-auto px-6 py-6">
            {/* Project context */}
            <div className="rounded-lg border border-primary/15 bg-primary/5 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <FolderKanban className="h-4 w-4 text-primary" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    Project
                  </p>

                  <p className="truncate text-sm font-semibold text-foreground">
                    {project.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Task details */}
            <section className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Task details
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  Define what needs to be completed.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-title">Title</Label>

                <Input
                  id="task-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Implement authentication"
                  maxLength={255}
                  autoFocus
                  disabled={mutation.isPending}
                />

                <div className="flex justify-end text-xs text-muted-foreground">
                  {title.length}/255
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-description">Description</Label>

                <textarea
                  id="task-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe what needs to be done..."
                  maxLength={5000}
                  rows={5}
                  disabled={mutation.isPending}
                  className="flex min-h-28 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none placeholder:text-muted-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />

                <div className="flex justify-end text-xs text-muted-foreground">
                  {description.length}/5000
                </div>
              </div>
            </section>

            {/* Configuration */}
            <section className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Configuration
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  Set the task workflow and responsibility.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="task-status">Status</Label>

                  <Select
                    value={status}
                    onValueChange={(value) => {
                      if (value) {
                        setStatus(value as TaskStatus);
                      }
                    }}
                    disabled={mutation.isPending}
                  >
                    <SelectTrigger id="task-status" className="w-full">
                      <SelectValue placeholder="Select status..." />
                    </SelectTrigger>

                    <SelectContent>
                      {statuses.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="task-priority">Priority</Label>

                  <Select
                    value={priority}
                    onValueChange={(value) => {
                      if (value) {
                        setPriority(value as TaskPriority);
                      }
                    }}
                    disabled={mutation.isPending}
                  >
                    <SelectTrigger id="task-priority" className="w-full">
                      <SelectValue placeholder="Select priority..." />
                    </SelectTrigger>

                    <SelectContent>
                      {priorities.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-assignee">Assignee</Label>

                <Select
                  value={assigneeId}
                  onValueChange={(value) => {
                    setAssigneeId(value ?? "");
                  }}
                  disabled={mutation.isPending || membersLoading}
                >
                  <SelectTrigger id="task-assignee" className="w-full">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>

                    {members.map((member) => (
                      <SelectItem key={member.id} value={String(member.id)}>
                        <div className="flex items-center gap-2">
                          <UserRound className="h-4 w-4 text-muted-foreground" />
                          {member.firstName} {member.lastName}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {membersLoading && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Spinner className="size-3.5" />
                    Loading team members...
                  </div>
                )}

                {!membersLoading && members.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No employees are currently assigned to this project&apos;s
                    team.
                  </p>
                )}

                <p className="text-xs text-muted-foreground">
                  Only employees belonging to the project team can be assigned.
                </p>
              </div>
            </section>
          </div>

          <DialogFooter className="border-t border-border bg-muted/20 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={!canSubmit || membersLoading}>
              {mutation.isPending
                ? "Saving..."
                : task
                  ? "Save changes"
                  : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

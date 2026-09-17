"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { employeeApi, taskApi, teamApi } from "@/lib/api";
import type {
  Employee,
  Project,
  Task,
  TaskPriority,
  TaskStatus,
} from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  task?: Task | null;
}

const statuses: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE", "CANCELLED"];

const priorities: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

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
      const data = {
        title: title.trim(),
        description: description.trim() || undefined,
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

    onError: () => {
      toast.add({
        title: "Operation failed",
        description: task
          ? "The task could not be updated."
          : "The task could not be created.",
        type: "error",
      });
    },
  });

  const canSubmit =
    title.trim().length > 0 &&
    title.trim().length <= 255 &&
    !mutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create Task"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="task-title" className="text-sm font-medium">
              Title
            </label>

            <Input
              id="task-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Implement authentication"
              maxLength={255}
              disabled={mutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="task-description" className="text-sm font-medium">
              Description
            </label>

            <textarea
              id="task-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe what needs to be done..."
              maxLength={5000}
              disabled={mutation.isPending}
              className="min-h-[120px] w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="task-status" className="text-sm font-medium">
                Status
              </label>

              <select
                id="task-status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as TaskStatus)
                }
                disabled={mutation.isPending}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                {statuses.map((item) => (
                  <option key={item} value={item}>
                    {formatStatus(item)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="task-priority" className="text-sm font-medium">
                Priority
              </label>

              <select
                id="task-priority"
                value={priority}
                onChange={(event) =>
                  setPriority(event.target.value as TaskPriority)
                }
                disabled={mutation.isPending}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                {priorities.map((item) => (
                  <option key={item} value={item}>
                    {formatPriority(item)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="task-assignee" className="text-sm font-medium">
              Assignee
            </label>

            <select
              id="task-assignee"
              value={assigneeId}
              onChange={(event) => setAssigneeId(event.target.value)}
              disabled={mutation.isPending || membersLoading}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Unassigned</option>

              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.firstName} {member.lastName}
                </option>
              ))}
            </select>

            <p className="text-xs text-muted-foreground">
              Only employees belonging to the project team can be assigned.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={!canSubmit}
          >
            {mutation.isPending
              ? "Saving..."
              : task
                ? "Update Task"
                : "Create Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function formatStatus(status: TaskStatus): string {
  return status
    .replace("_", " ")
    .toLowerCase()
    .replace(/^\w/, (character) => character.toUpperCase());
}

function formatPriority(priority: TaskPriority): string {
  return priority.charAt(0) + priority.slice(1).toLowerCase();
}

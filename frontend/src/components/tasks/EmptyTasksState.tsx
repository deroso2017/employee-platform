export function EmptyTasksState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 shadow-sm">
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">{message}</p>

        <p className="mt-1 text-xs text-muted-foreground">
          {message === "No projects available."
            ? "Create a project first to start managing tasks."
            : "Try adjusting your search or create a new task."}
        </p>
      </div>
    </div>
  );
}

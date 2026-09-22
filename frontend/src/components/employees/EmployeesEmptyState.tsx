import { UsersRound } from "lucide-react";

interface EmployeesEmptyStateProps {
  searching: boolean;
  onCreate: () => void;
}

export function EmployeesEmptyState({
  searching,
  onCreate,
}: EmployeesEmptyStateProps) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <UsersRound className="size-6" />
      </div>

      <h3 className="font-semibold">
        {searching ? "No employees found" : "No employees yet"}
      </h3>

      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {searching
          ? "Try a different name or search term."
          : "Create your first employee to get started."}
      </p>

      {!searching && (
        <button
          type="button"
          onClick={onCreate}
          className="mt-5 text-sm font-medium text-primary hover:underline"
        >
          Create employee
        </button>
      )}
    </div>
  );
}

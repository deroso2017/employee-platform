export function EmployeesSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
      <div className="space-y-0">
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 border-b border-border px-5 py-4 last:border-b-0"
          >
            <div className="size-9 animate-pulse rounded-full bg-muted" />

            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 animate-pulse rounded bg-muted" />
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            </div>

            <div className="hidden h-4 w-48 animate-pulse rounded bg-muted md:block" />
            <div className="hidden h-5 w-24 animate-pulse rounded bg-muted md:block" />
            <div className="size-8 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

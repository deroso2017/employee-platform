import { PageContainer } from "@/components/layout/PageContainer";

export function DashboardSkeleton() {
  return (
    <PageContainer>
      <div className="animate-pulse">
        <div className="h-8 w-40 rounded-md bg-muted" />

        <div className="mt-2 h-4 w-96 max-w-full rounded bg-muted" />

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-32 rounded-xl border border-border/80 bg-card"
            />
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="h-80 rounded-xl border border-border/80 bg-card" />
          <div className="h-80 rounded-xl border border-border/80 bg-card" />
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.35fr_1fr]">
          <div className="h-72 rounded-xl border border-border/80 bg-card" />
          <div className="h-72 rounded-xl border border-border/80 bg-card" />
        </div>
      </div>
    </PageContainer>
  );
}

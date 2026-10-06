import { Card, CardContent } from "@/components/ui/card";

export function TeamsSkeleton() {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="rounded-xl border-border shadow-sm">
            <CardContent className="p-5">
              <div className="animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-muted" />

                  <div className="flex-1">
                    <div className="h-4 w-32 rounded bg-muted" />
                    <div className="mt-2 h-3 w-20 rounded bg-muted" />
                  </div>
                </div>

                <div className="mt-5 h-8 rounded bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

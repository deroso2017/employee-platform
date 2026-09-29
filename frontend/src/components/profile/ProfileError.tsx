import { CircleAlert } from "lucide-react";
import { Button } from "../ui/button";

export function ProfileError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
        <CircleAlert className="size-5 text-muted-foreground" />
      </div>

      <h2 className="font-semibold">Could not load your profile</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        Please check your connection and try again.
      </p>

      <div className="flex justify-center gap-3 items-center mt-5">
        <Button variant="outline" onClick={() => window.location.assign("/")}>
          Go to home
        </Button>
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      </div>
    </div>
  );
}

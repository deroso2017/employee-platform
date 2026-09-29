import { UserRound } from "lucide-react";

export function ProfileCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound;
  label: string;
  value?: unknown; // Allow any type safely
}) {
  // Safely resolve the value to a string whether it's a string, number, or object (like department)
  let resolvedValue = "";
  if (value !== null && value !== undefined) {
    if (typeof value === "object" && "name" in value) {
      resolvedValue = String((value as { name: unknown }).name ?? "");
    } else {
      resolvedValue = String(value);
    }
  }

  const trimmedValue = resolvedValue.trim();

  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl border border-border bg-background p-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 wrap-break-word text-sm font-medium">
          {trimmedValue || "Not provided"}
        </p>
      </div>
    </div>
  );
}

import Link from "next/link";

export function Brand() {
  return (
    <Link
      href="/dashboard"
      className="
        flex shrink-0 items-center gap-2.5
        rounded-md
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-ring
      "
    >
      <span
        className="
          flex size-8 items-center justify-center
          rounded-lg
          bg-primary
          text-sm font-bold
          text-primary-foreground
          shadow-sm
        "
      >
        R
      </span>

      <span className="hidden text-sm font-semibold tracking-tight sm:block">
        RoniTech
      </span>
    </Link>
  );
}

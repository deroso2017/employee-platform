import { employeeApi } from "@/lib/api";
import { useProfileImage } from "@/lib/hooks/useProfileImage";
import { Employee } from "@/lib/types";

export const DEFAULT_AVATAR = "/default-avatar.svg";

export function EmployeeAvatar({ employee }: { employee: Employee }) {
  const apiSrc = employee.profileImage
    ? employeeApi.profileImageUrl(employee.id)
    : null;

  const blobUrl = useProfileImage(apiSrc);
  const src = blobUrl ?? DEFAULT_AVATAR;

  return (
    <div className="size-10 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`${employee.firstName} ${employee.lastName}`}
        className="size-full object-cover"
      />
    </div>
  );
}

import { useState, useEffect } from "react";
import api from "@/lib/api";

/**
 * Fetches a protected image URL through the Axios client (which attaches the
 * Bearer token) and returns a local blob URL safe to use in <img> tags.
 * Returns null while loading or if no src is provided.
 */
export function useProfileImage(src: string | null | undefined): string | null {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!src) return;

    let objectUrl: string | null = null;
    let cancelled = false;

    api
      .get<Blob>(src, { responseType: "blob" })
      .then(({ data }) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(data);
        setBlobUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setBlobUrl(null);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  return src ? blobUrl : null;
}

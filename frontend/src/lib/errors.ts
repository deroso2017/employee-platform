import { isAxiosError } from "axios";

/**
 * Shape of the error response body returned by the Spring Boot
 * GlobalExceptionHandler. All fields are optional so the type is
 * safe to use even when the server sends a non-standard payload.
 */
interface ApiErrorBody {
  message?: string;
  error?: string;
  /** Validation field errors, e.g. { email: "must not be blank" } */
  errors?: Record<string, string>;
  status?: number;
  timestamp?: string;
}

/**
 * Typed wrapper around an Axios error response.
 *
 * Usage:
 *   catch (err) {
 *     throw ApiError.from(err);
 *   }
 *
 * Or just use `extractErrorMessage(err)` when you only need the string.
 */
export class ApiError extends Error {
  /** HTTP status code, or 0 for network / unknown errors. */
  readonly status: number;
  /** Structured body from the server, if any. */
  readonly body: ApiErrorBody | null;

  constructor(message: string, status: number, body: ApiErrorBody | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }

  /**
   * Convert any caught value into an ApiError.
   * - Axios errors → reads response body
   * - Plain Error  → wraps it
   * - Anything else → generic fallback
   */
  static from(err: unknown): ApiError {
    if (err instanceof ApiError) return err;

    if (isAxiosError(err)) {
      const status = err.response?.status ?? 0;
      const body = (err.response?.data ?? null) as ApiErrorBody | null;
      const message =
        body?.message ??
        body?.error ??
        (body?.errors ? Object.values(body.errors).join(", ") : null) ??
        err.message ??
        "An unexpected error occurred.";
      return new ApiError(message, status, body);
    }

    if (err instanceof Error) {
      return new ApiError(err.message, 0, null);
    }

    return new ApiError("An unexpected error occurred.", 0, null);
  }
}

/**
 * Extract a human-readable error message from any caught value.
 *
 * This is the primary helper to use at call sites — it converts
 * Axios errors, plain Errors, and unknown throws into a single string
 * suitable for display in the UI.
 *
 * @param err       The caught value from a catch block.
 * @param fallback  Optional fallback string (defaults to generic message).
 */
export function extractErrorMessage(err: unknown, fallback?: string): string {
  return ApiError.from(err).message || (fallback ?? "An unexpected error occurred.");
}

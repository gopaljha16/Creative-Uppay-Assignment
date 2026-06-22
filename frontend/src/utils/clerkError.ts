/**
 * Extract a human-readable error message from Clerk API errors.
 * Falls back to a provided default message.
 */
export function extractClerkError(err: unknown, fallback: string): string {
  if (
    err &&
    typeof err === "object" &&
    "errors" in err &&
    Array.isArray((err as { errors: { message: string }[] }).errors)
  ) {
    return (err as { errors: { message: string }[] }).errors[0]?.message || fallback;
  }
  return fallback;
}

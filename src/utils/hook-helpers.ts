/**
 * Hook helpers
 * Shared error handling utilities for React hooks.
 */

/**
 * Extracts a user-facing error message from an unknown thrown value.
 * Returns the Error's `message` when the value is an Error instance,
 * otherwise falls back to the provided `fallback` (or a default).
 */
export function getErrorMessage(err: unknown, fallback?: string): string {
  if (err instanceof Error) {
    return err.message || fallback || 'An unexpected error occurred.';
  }
  return fallback || 'An unexpected error occurred.';
}

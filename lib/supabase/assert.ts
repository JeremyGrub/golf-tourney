import type { PostgrestError } from "@supabase/supabase-js";

/**
 * Supabase resolves to `{ data, error }` rather than rejecting, so an ignored
 * `error` is indistinguishable from an empty result. Left unchecked that turns
 * an outage into a lie: a dead backend renders as "no such tournament" or an
 * empty field, and the reader goes hunting for a mistake that isn't theirs.
 *
 * Call this before interpreting `data`, so a failed query reaches error.tsx —
 * which says so honestly and offers a retry — instead of a not-found page.
 */
export function assertLoaded(error: PostgrestError | null, what: string): void {
  if (!error) return;
  throw new Error(`could not load ${what} — ${error.message}`, { cause: error });
}

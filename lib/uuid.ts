/**
 * Matches tokens/ids shaped like UUIDs.
 *
 * Worth checking before any `.eq()` against a uuid column: Postgres raises
 * `22P02 invalid input syntax for type uuid` on garbage, which surfaces as a
 * PostgrestError. Without a shape check that error is indistinguishable from
 * a real backend failure, so `/tournaments/garbage` would render "something
 * broke" instead of an honest not-found.
 */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

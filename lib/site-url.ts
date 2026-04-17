import { headers } from "next/headers";

/**
 * Canonical public origin for this deployment — scheme + host, no trailing
 * slash. Use anywhere a URL has to be embedded in something that leaves the
 * server (magic-link emails, OG images, `metadataBase`, Supabase redirects).
 *
 * Precedence:
 *   1. NEXT_PUBLIC_SITE_URL — set this on Vercel (e.g. https://thru.golf) so
 *      preview-deploy links still point at your canonical domain when you
 *      want them to.
 *   2. VERCEL_URL — auto-set by Vercel to the deploy-specific hostname,
 *      useful on preview deployments when NEXT_PUBLIC_SITE_URL isn't set.
 *   3. http://localhost:3000 — local dev fallback.
 */
export function getSiteUrl(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

/**
 * Origin for the *current* request. Prefers NEXT_PUBLIC_SITE_URL when set
 * (so magic-link redirects always land on the canonical domain), then
 * falls back to the request's forwarded-proto/host (Vercel's proxy), then
 * the raw Host header, then localhost.
 *
 * This must be called from a server context that has a request —
 * server actions, route handlers, server components during render.
 */
export async function getRequestOrigin(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
  }
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return getSiteUrl();
  const proto =
    h.get("x-forwarded-proto") ??
    (/^(localhost|127\.|\[::1\])/.test(host) ? "http" : "https");
  return `${proto}://${host}`;
}

import Link from "next/link";
import { signInWithEmail } from "./actions";

type SearchParams = Promise<{ sent?: string; to?: string; err?: string }>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const sent = sp.sent === "1";
  const to = sp.to;
  const err = sp.err;

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <div className="absolute inset-0 cm-grid-fine opacity-40 pointer-events-none" aria-hidden />

      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-20">
        <Link
          href="/"
          className="mb-12 inline-flex items-baseline gap-2 font-display text-3xl font-semibold tracking-tight text-ink"
        >
          thru<span className="text-topo">.</span>
        </Link>

        <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.22em] text-blueprint">
          · / host sign-in
        </div>
        <h1 className="mb-8 font-display text-5xl font-semibold leading-[0.95] tracking-tight">
          Back to the <span className="italic text-forest" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}>clubhouse.</span>
        </h1>

        {sent ? (
          <div className="rounded-2xl border border-forest/30 bg-chalk p-6">
            <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.22em] text-forest">
              · / link sent
            </div>
            <p className="text-ink/80">
              Open your inbox at <span className="font-medium">{to ?? "your email"}</span> and tap
              the sign-in link. You can close this tab.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block font-mono text-[11px] uppercase tracking-[0.18em] text-blueprint hover:text-ink"
            >
              ← use a different email
            </Link>
          </div>
        ) : (
          <form action={signInWithEmail} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-blueprint"
              >
                email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoFocus
                autoComplete="email"
                placeholder="you@club.com"
                className="w-full rounded-2xl border border-ink/15 bg-chalk px-5 py-4 font-sans text-lg text-ink placeholder:text-ink/30 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
              />
            </div>

            {err === "bad_email" && (
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-topo">
                · please enter a valid email
              </p>
            )}
            {err === "send_failed" && (
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-topo">
                · couldn&apos;t send the link — try again?
              </p>
            )}

            <button
              type="submit"
              className="group relative flex w-full items-center justify-between rounded-full bg-ink px-6 py-4 font-mono text-xs uppercase tracking-[0.2em] text-chalk transition-transform hover:-translate-y-0.5"
            >
              send me a magic link
              <span aria-hidden>→</span>
            </button>

            <p className="pt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-blueprint">
              no password. a one-tap link hits your inbox.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

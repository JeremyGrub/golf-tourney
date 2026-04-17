import Link from "next/link";

// loadLeaderboard() filters tournaments to status in (live, complete) and
// calls notFound() when the slug doesn't exist or is still a draft. So this
// page covers both "wrong link" and "the host hasn't tipped off yet".
export default function LeaderboardNotFound() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center px-6 py-16">
      <div className="absolute inset-0 cm-grid-fine pointer-events-none opacity-50" aria-hidden />
      <div
        className="absolute inset-0 cm-contours pointer-events-none opacity-30"
        aria-hidden
      />

      <div className="relative w-full max-w-xl rounded-[28px] border border-ink/10 bg-chalk p-8 md:p-12">
        <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-blueprint">
          · / leaderboard
        </div>
        <h1 className="font-display text-4xl font-semibold leading-[0.95] tracking-tight md:text-5xl">
          No tournament here{" "}
          <span
            className="italic text-forest"
            style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}
          >
            yet.
          </span>
        </h1>
        <p className="mt-4 text-ink/70">
          This link doesn&apos;t match a published tournament. The host might
          still be setting it up, or the URL might be off by a character. Ask
          whoever sent it to double-check.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-3 rounded-full bg-topo px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] text-chalk transition-transform hover:-translate-y-0.5"
          >
            Back to home <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

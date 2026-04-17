import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center px-6 py-16">
      <div className="absolute inset-0 cm-grid-fine pointer-events-none opacity-60" aria-hidden />
      <div
        className="absolute inset-0 cm-contours pointer-events-none opacity-30"
        aria-hidden
      />

      <div className="relative w-full max-w-xl rounded-[28px] border border-ink/10 bg-chalk p-8 md:p-12">
        <div className="mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-blueprint">
          <span className="cm-tabular text-topo">404</span>
          <span>/ off the map</span>
        </div>
        <h1 className="font-display text-5xl font-semibold leading-[0.95] tracking-tight md:text-6xl">
          We can&apos;t find this hole.
        </h1>
        <p className="mt-4 max-w-md text-ink/70">
          The link might be stale, the tournament might have finished, or this
          page may not exist. Either way — the clubhouse is this way.
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

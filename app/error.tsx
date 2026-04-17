"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[thru.] root error:", error);
  }, [error]);

  return (
    <main className="relative flex min-h-dvh items-center justify-center px-6 py-16">
      <div className="absolute inset-0 cm-grid-fine pointer-events-none opacity-60" aria-hidden />
      <div
        className="absolute inset-0 cm-contours pointer-events-none opacity-30"
        aria-hidden
      />

      <div className="relative w-full max-w-xl rounded-[28px] border border-ink/10 bg-chalk p-8 md:p-12">
        <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-topo">
          · / out of bounds
        </div>
        <h1 className="font-display text-4xl font-semibold leading-[0.95] tracking-tight md:text-5xl">
          Something landed in the rough.{" "}
          <span
            className="italic text-forest"
            style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}
          >
            We&apos;ll re-tee.
          </span>
        </h1>
        <p className="mt-4 max-w-md text-ink/70">
          An unexpected error happened on the way to this page. You can try
          again, or head back to the home tee.
        </p>

        {error.digest && (
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/40">
            ref · {error.digest}
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-3 rounded-full bg-topo px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] text-chalk transition-transform hover:-translate-y-0.5"
          >
            Try again <span aria-hidden>↻</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] text-ink/70 hover:border-ink/30 hover:text-ink"
          >
            <span aria-hidden>←</span> Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}

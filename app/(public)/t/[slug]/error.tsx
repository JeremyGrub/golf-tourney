"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function LeaderboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[thru.] leaderboard error:", error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-16 pt-10 md:px-8">
      <div className="rounded-[20px] border border-ink/10 bg-chalk p-6 md:p-10">
        <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.22em] text-topo">
          · / lost the signal
        </div>
        <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
          We couldn&apos;t pull the leaderboard.
        </h1>
        <p className="mt-3 max-w-md text-ink/70">
          Could be a flaky connection or a hiccup on our end. Give it another
          shot — we&apos;ll keep watching the wire.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/40">
            ref · {error.digest}
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-3 rounded-full bg-topo px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] text-chalk transition-transform hover:-translate-y-0.5"
          >
            Refresh leaderboard <span aria-hidden>↻</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] text-ink/70 hover:border-ink/30 hover:text-ink"
          >
            <span aria-hidden>←</span> Home
          </Link>
        </div>
      </div>
    </div>
  );
}

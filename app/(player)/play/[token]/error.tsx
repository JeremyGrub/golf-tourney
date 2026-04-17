"use client";

import { useEffect } from "react";

export default function ScorecardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[thru.] scorecard error:", error);
  }, [error]);

  return (
    <div className="space-y-6">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-topo">
        · / sync hiccup
      </div>
      <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight">
        We lost your card for a sec.
      </h1>
      <div className="rounded-[20px] border border-ink/10 bg-chalk p-5">
        <p className="text-sm text-ink/70">
          Reconnecting usually clears it. If you tapped a hole offline, your
          scores are still queued — they&apos;ll post once you&apos;re back on
          a signal.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/40">
            ref · {error.digest}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => reset()}
        className="inline-flex items-center gap-3 rounded-full bg-topo px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] text-chalk transition-transform hover:-translate-y-0.5"
      >
        Reload card <span aria-hidden>↻</span>
      </button>
    </div>
  );
}

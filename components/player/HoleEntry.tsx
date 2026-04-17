"use client";

import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { submitScore } from "@/app/(player)/play/[token]/actions";
import { classifyStroke } from "@/lib/scoring/compute";

type Props = {
  token: string;
  holeNumber: number;
  totalHoles: number;
  par: number;
  initialStrokes: number | null;
  prevHref: string | null;
  nextHref: string | null;
  scorecardHref: string;
};

export default function HoleEntry({
  token,
  holeNumber,
  totalHoles,
  par,
  initialStrokes,
  prevHref,
  nextHref,
  scorecardHref,
}: Props) {
  const [strokes, setStrokes] = useState<number>(initialStrokes ?? par);
  const [optimisticStrokes, applyOptimistic] = useOptimistic(
    strokes,
    (_state, next: number) => next
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function commit(next: number) {
    if (next < 1) next = 1;
    if (next > 15) next = 15;
    setStrokes(next);
    setError(null);
    startTransition(async () => {
      applyOptimistic(next);
      const result = await submitScore(token, holeNumber, next);
      if (!result.ok) {
        setError(
          result.error.includes("tournament_not_live")
            ? "This tournament hasn't tipped off yet."
            : "Couldn't sync. Try again."
        );
      }
    });
  }

  const cls = classifyStroke(optimisticStrokes, par);
  const diff = optimisticStrokes - par;
  const diffLabel =
    diff === 0 ? "even par" : diff > 0 ? `+${diff} vs par` : `${diff} vs par`;

  const badge =
    cls === "eagle"
      ? "eagle"
      : cls === "birdie"
      ? "birdie"
      : cls === "par"
      ? "par"
      : cls === "bogey"
      ? "bogey"
      : "double+";

  const ringTone =
    cls === "eagle"
      ? "ring-topo/40 bg-topo/5"
      : cls === "birdie"
      ? "ring-forest/30 bg-forest/5"
      : cls === "bogey" || cls === "double"
      ? "ring-blueprint/30 bg-blueprint/5"
      : "ring-ink/15 bg-chalk";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={scorecardHref}
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60 hover:text-ink"
        >
          ← card
        </Link>
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-blueprint cm-tabular">
          hole {holeNumber} / {totalHoles}
        </div>
      </div>

      <div
        className={`relative overflow-hidden rounded-[28px] border border-ink/10 ring-1 ${ringTone} px-6 pb-8 pt-7`}
      >
        <div
          className="absolute inset-0 cm-contours opacity-20 pointer-events-none"
          aria-hidden
        />
        <div className="relative">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-blueprint">
            par {par}
          </div>
          <div className="mt-1 flex items-baseline gap-3">
            <div className="font-display text-6xl font-semibold tracking-tight">
              {holeNumber}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/50">
              {diffLabel}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <StrokeButton
              aria-label="decrement stroke"
              onClick={() => commit(optimisticStrokes - 1)}
              disabled={optimisticStrokes <= 1}
              symbol="−"
            />
            <div className="flex flex-col items-center">
              <span className="font-display text-8xl font-semibold leading-none tabular-nums cm-tabular">
                {optimisticStrokes}
              </span>
              <span
                className={`mt-2 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] ${
                  cls === "eagle"
                    ? "bg-topo text-chalk"
                    : cls === "birdie"
                    ? "bg-forest text-chalk"
                    : cls === "par"
                    ? "bg-ink/10 text-ink"
                    : "bg-blueprint/15 text-blueprint"
                }`}
              >
                {badge}
              </span>
            </div>
            <StrokeButton
              aria-label="increment stroke"
              onClick={() => commit(optimisticStrokes + 1)}
              disabled={optimisticStrokes >= 15}
              symbol="+"
            />
          </div>

          <div className="mt-8 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em]">
            <span className="text-ink/40">
              {isPending ? "saving…" : error ? "try again" : "saved"}
            </span>
            {error && <span className="text-topo">{error}</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {prevHref ? (
          <Link
            href={prevHref}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 bg-chalk px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/70 hover:border-ink/30"
          >
            ← prev
          </Link>
        ) : (
          <span />
        )}
        {nextHref ? (
          <Link
            href={nextHref}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-chalk hover:-translate-y-0.5 transition-transform"
          >
            next hole →
          </Link>
        ) : (
          <Link
            href={scorecardHref}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-topo px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-chalk hover:-translate-y-0.5 transition-transform"
          >
            finish · card →
          </Link>
        )}
      </div>
    </div>
  );
}

function StrokeButton({
  onClick,
  disabled,
  symbol,
  ...rest
}: {
  onClick: () => void;
  disabled?: boolean;
  symbol: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group relative flex h-20 w-20 items-center justify-center rounded-full border border-ink/15 bg-chalk text-4xl font-semibold text-ink shadow-[0_10px_24px_-18px_rgba(14,18,15,0.45)] transition-transform active:translate-y-0.5 disabled:opacity-30"
      {...rest}
    >
      <span className="-mt-1">{symbol}</span>
    </button>
  );
}

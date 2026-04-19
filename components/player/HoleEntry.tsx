"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { submitScore } from "@/app/(player)/play/[token]/actions";
import { classifyStroke } from "@/lib/scoring/compute";
import { enqueueScore } from "@/lib/offline/queue";

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

/**
 * Save status machine for the hole entry screen.
 *
 *   saved    — server holds the current value
 *   editing  — user has tapped +/-; value is local-only, pending flush
 *   saving   — flush in flight
 *   queued   — flush happened while offline; queued for replay
 *   error    — flush hit a non-transient failure (tournament not live, etc.)
 *
 * Score submits are deferred: we only call the RPC when the player
 * navigates away from the hole (prev / next / finish / card). This keeps
 * the public leaderboard from flickering while someone taps down to
 * albatross for the bit and back up to their real score.
 */
type SaveStatus = "saved" | "editing" | "saving" | "queued" | "error";

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
  const [status, setStatus] = useState<SaveStatus>(
    // If there's already a saved stroke count, start in "saved"; if the
    // player hasn't touched this hole yet, we pre-fill with par and call
    // that a draft until they explicitly commit (by tapping +/- or
    // navigating — either way, their intent gets recorded).
    initialStrokes != null ? "saved" : "editing"
  );
  const [error, setError] = useState<string | null>(null);

  // The most recent value the user touched that hasn't been shipped yet.
  // Cleared when a flush starts; reset if they tap again during save.
  const pendingRef = useRef<number | null>(
    initialStrokes == null ? par : null
  );

  const submit = useCallback(
    async (value: number) => {
      setStatus("saving");
      setError(null);

      // Offline at submit time — skip the server action entirely and queue
      // for the OfflineShell to drain later.
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        await enqueueScore({
          token,
          holeNumber,
          strokes: value,
          queuedAt: Date.now(),
        });
        setStatus("queued");
        return;
      }

      try {
        const result = await submitScore(token, holeNumber, value);
        if (!result.ok) {
          setError(
            result.error.includes("tournament_not_live")
              ? "This tournament hasn't tipped off yet."
              : "Couldn't sync. Try again."
          );
          setStatus("error");
          return;
        }
        setStatus("saved");
      } catch {
        // Transport failure (network dropped mid-flight, Server Action
        // couldn't reach the server). Queue and show the offline affordance.
        await enqueueScore({
          token,
          holeNumber,
          strokes: value,
          queuedAt: Date.now(),
        });
        setStatus("queued");
      }
    },
    [token, holeNumber]
  );

  // On every +/- tap: update the display and remember the value. No
  // network call here — the leaderboard stays quiet until the player
  // moves on.
  function commit(next: number) {
    if (next < 1) next = 1;
    if (next > 15) next = 15;
    setStrokes(next);
    pendingRef.current = next;
    setStatus("editing");
    setError(null);
  }

  // Flush on unmount. Catches every way the player can leave this hole:
  // prev/next/finish Links, the "← card" link, browser back, a fresh
  // navigation from the offline shell, all of them. The fetch survives
  // the unmount — the browser keeps the request in flight even as the
  // component tears down.
  useEffect(() => {
    return () => {
      const v = pendingRef.current;
      if (v != null) {
        pendingRef.current = null;
        void submit(v);
      }
    };
  }, [submit]);

  const cls = classifyStroke(strokes, par);
  const diff = strokes - par;
  const diffLabel =
    diff === 0 ? "even par" : diff > 0 ? `+${diff} vs par` : `${diff} vs par`;

  // Name the rare ones; let the numeric label carry the weight once we
  // hit +4 or worse (quad/snowman territory — "quintuple bogey" on a pill
  // looks absurd, "+5" is honest).
  const badge =
    cls === "albatross"
      ? "albatross"
      : cls === "eagle"
      ? "eagle"
      : cls === "birdie"
      ? "birdie"
      : cls === "par"
      ? "par"
      : cls === "bogey"
      ? "bogey"
      : cls === "double"
      ? "double"
      : cls === "triple"
      ? "triple"
      : `+${diff}`;

  // The surrounding card ring mirrors the pill — celebrate sub-par, stay
  // cool on par, lean blueprint on over-par, fade into ink as we pile on.
  const ringTone =
    cls === "albatross" || cls === "eagle"
      ? "ring-topo/40 bg-topo/5"
      : cls === "birdie"
      ? "ring-forest/30 bg-forest/5"
      : cls === "bogey" || cls === "double"
      ? "ring-blueprint/30 bg-blueprint/5"
      : cls === "triple" || cls === "big"
      ? "ring-ink/20 bg-ink/5"
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
              onClick={() => commit(strokes - 1)}
              disabled={strokes <= 1}
              symbol="−"
            />
            <div className="flex flex-col items-center">
              <span className="font-display text-8xl font-semibold leading-none tabular-nums cm-tabular">
                {strokes}
              </span>
              <span
                className={`mt-2 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] ${
                  cls === "albatross"
                    ? "bg-topo-deep text-chalk"
                    : cls === "eagle"
                    ? "bg-topo text-chalk"
                    : cls === "birdie"
                    ? "bg-forest text-chalk"
                    : cls === "par"
                    ? "bg-ink/10 text-ink"
                    : cls === "bogey" || cls === "double"
                    ? "bg-blueprint/15 text-blueprint"
                    : "bg-ink/15 text-ink/70"
                }`}
              >
                {badge}
              </span>
            </div>
            <StrokeButton
              aria-label="increment stroke"
              onClick={() => commit(strokes + 1)}
              disabled={strokes >= 15}
              symbol="+"
            />
          </div>

          <div className="mt-8 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em]">
            <span
              className={
                status === "queued" || status === "error"
                  ? "text-topo-deep"
                  : status === "editing"
                  ? "text-blueprint"
                  : "text-ink/40"
              }
            >
              {status === "editing"
                ? "draft · saves when you move on"
                : status === "saving"
                ? "saving…"
                : status === "queued"
                ? "queued · syncs when back online"
                : status === "error"
                ? "try again"
                : "saved"}
            </span>
            {error && <span className="text-topo-deep">{error}</span>}
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

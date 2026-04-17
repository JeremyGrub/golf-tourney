"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { submitScore } from "@/app/(player)/play/[token]/actions";
import {
  countQueuedScores,
  dequeueScore,
  listQueuedScores,
  onQueueChange,
} from "@/lib/offline/queue";

/**
 * Wraps the player UI with a network-aware banner and a background drainer:
 *  - Watches `online`/`offline` window events + the queue's own change event.
 *  - Flushes queued scores sequentially whenever the browser reports online.
 *  - Stops flushing on the first failure so we don't hammer a degraded
 *    connection; the next online event or queue change triggers a retry.
 *
 * Lives in the player route group layout so it survives navigations between
 * the scorecard and the per-hole page without losing state.
 */
export default function OfflineShell({
  children,
}: {
  children: React.ReactNode;
}) {
  // `null` = "we haven't checked yet"; hides the banner during SSR hydration.
  const [online, setOnline] = useState<boolean | null>(null);
  const [queuedCount, setQueuedCount] = useState<number>(0);
  const [syncing, setSyncing] = useState<boolean>(false);
  const flushingRef = useRef<boolean>(false);

  const refreshCount = useCallback(async () => {
    setQueuedCount(await countQueuedScores());
  }, []);

  const flush = useCallback(async () => {
    if (flushingRef.current) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) return;
    flushingRef.current = true;
    setSyncing(true);
    try {
      const items = await listQueuedScores();
      for (const it of items) {
        try {
          const res = await submitScore(it.token, it.holeNumber, it.strokes);
          if (res.ok) {
            await dequeueScore(it.token, it.holeNumber);
          } else {
            // Server rejected (e.g. tournament_not_live). Drop it so we
            // don't loop forever; user will see no "queued" pill anymore
            // and can re-enter if needed.
            await dequeueScore(it.token, it.holeNumber);
          }
        } catch {
          // Network or server-action transport failure. Bail — next online
          // event will pick up from here.
          break;
        }
      }
    } finally {
      flushingRef.current = false;
      setSyncing(false);
      await refreshCount();
    }
  }, [refreshCount]);

  useEffect(() => {
    setOnline(navigator.onLine);
    void refreshCount();
    if (navigator.onLine) void flush();

    const handleOnline = () => {
      setOnline(true);
      void flush();
    };
    const handleOffline = () => setOnline(false);
    const handleQueue = () => {
      void refreshCount();
      // If an enqueue happened while nominally online (e.g. a transient
      // 5xx), try to drain immediately.
      if (navigator.onLine) void flush();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    const unsubscribe = onQueueChange(handleQueue);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      unsubscribe();
    };
  }, [flush, refreshCount]);

  const show =
    online === false || queuedCount > 0 || syncing;

  return (
    <>
      {show && (
        <div
          role="status"
          aria-live="polite"
          className={
            "mb-4 flex items-center gap-2 rounded-[14px] border px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em] " +
            (online === false
              ? "border-topo-deep/30 bg-topo/10 text-topo-deep"
              : syncing
              ? "border-blueprint/30 bg-blueprint/10 text-blueprint"
              : "border-forest/30 bg-forest/10 text-forest")
          }
        >
          <span
            aria-hidden
            className={
              "inline-block h-1.5 w-1.5 rounded-full " +
              (online === false
                ? "bg-topo cm-blink"
                : syncing
                ? "bg-blueprint cm-blink"
                : "bg-forest")
            }
          />
          {online === false ? (
            <span>
              offline · {queuedCount} hole
              {queuedCount === 1 ? "" : "s"} queued
            </span>
          ) : syncing ? (
            <span>
              syncing {queuedCount} hole
              {queuedCount === 1 ? "" : "s"}…
            </span>
          ) : (
            <span>
              {queuedCount} hole{queuedCount === 1 ? "" : "s"} queued
            </span>
          )}
        </div>
      )}
      {children}
    </>
  );
}

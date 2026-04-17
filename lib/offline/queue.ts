"use client";

// IndexedDB-backed queue for pending score submissions. localForage gives us
// a Promise-y wrapper and falls back to WebSQL/localStorage if IDB is
// unavailable — so this works in private-mode Safari too.
//
// One entry per (token, hole): a second tap on the same hole before we've
// drained the queue *overwrites* the previous value, which matches the
// "last tap wins" UX you'd expect from tapping +/- a few times.

import localforage from "localforage";

export type QueuedScore = {
  token: string;
  holeNumber: number;
  strokes: number;
  queuedAt: number;
};

const QUEUE_CHANGE_EVENT = "cm:queue-change";

// Lazy so Next doesn't try to construct on the server during import.
let _store: LocalForage | null = null;
function store(): LocalForage {
  if (!_store) {
    _store = localforage.createInstance({
      name: "thru",
      storeName: "score_queue",
      description: "Pending score submissions waiting to sync",
    });
  }
  return _store;
}

function keyFor(token: string, holeNumber: number): string {
  return `${token}::${holeNumber}`;
}

function emit(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(QUEUE_CHANGE_EVENT));
}

export async function enqueueScore(entry: QueuedScore): Promise<void> {
  await store().setItem(keyFor(entry.token, entry.holeNumber), entry);
  emit();
}

export async function dequeueScore(
  token: string,
  holeNumber: number
): Promise<void> {
  await store().removeItem(keyFor(token, holeNumber));
  emit();
}

export async function listQueuedScores(): Promise<QueuedScore[]> {
  const items: QueuedScore[] = [];
  await store().iterate<QueuedScore, void>((value) => {
    items.push(value);
  });
  // Drain in the order they were queued so later overwrites beat earlier ones.
  items.sort((a, b) => a.queuedAt - b.queuedAt);
  return items;
}

export async function countQueuedScores(): Promise<number> {
  return store().length();
}

/**
 * Subscribe to queue mutations. Returns an unsubscribe function.
 * Fires after every enqueue/dequeue in this tab. Cross-tab sync isn't worth
 * the complexity for a casual golf round.
 */
export function onQueueChange(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(QUEUE_CHANGE_EVENT, callback);
  return () => window.removeEventListener(QUEUE_CHANGE_EVENT, callback);
}

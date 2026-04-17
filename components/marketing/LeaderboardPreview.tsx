"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

type Player = {
  id: string;
  name: string;
  hometown: string;
  score: number;
  thru: number;
};

const INITIAL: Player[] = [
  { id: "ortiz", name: "R. Ortiz", hometown: "Tucson, AZ", score: -4, thru: 14 },
  { id: "koepp", name: "S. Koepp", hometown: "Madison, WI", score: -3, thru: 13 },
  { id: "malloy", name: "J. Malloy", hometown: "Austin, TX", score: -2, thru: 14 },
  { id: "tran", name: "M. Tran", hometown: "Seattle, WA", score: 0, thru: 12 },
  { id: "okafor", name: "D. Okafor", hometown: "Atlanta, GA", score: 1, thru: 13 },
  { id: "novak", name: "L. Novak", hometown: "Cleveland, OH", score: 2, thru: 11 },
  { id: "singh", name: "A. Singh", hometown: "Surrey, BC", score: 3, thru: 12 },
  { id: "heath", name: "C. Heath", hometown: "Portland, ME", score: 5, thru: 11 },
];

function formatScore(n: number) {
  if (n === 0) return "E";
  return n > 0 ? `+${n}` : `${n}`;
}

export default function LeaderboardPreview() {
  const [players, setPlayers] = useState<Player[]>(INITIAL);
  const [flashId, setFlashId] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => {
      setPlayers((prev) => {
        const next = prev.map((p) => ({ ...p }));
        // pick a random player still mid-round and nudge their score
        const candidates = next.filter((p) => p.thru < 18);
        if (candidates.length === 0) return prev;
        const target = candidates[Math.floor(Math.random() * candidates.length)];
        const delta = Math.random() < 0.45 ? -1 : Math.random() < 0.7 ? 0 : 1;
        target.score += delta;
        target.thru += 1;
        setFlashId(target.id);
        setTimeout(() => setFlashId(null), 900);
        return [...next].sort(
          (a, b) => a.score - b.score || b.thru - a.thru || a.name.localeCompare(b.name)
        );
      });
    }, 2400);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="demo" className="relative">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-6 py-24 md:grid-cols-12 md:px-10 md:py-32">
        <div className="md:col-span-5">
          <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-blueprint">
            · / live demo
          </div>
          <h2 className="font-display text-5xl font-semibold leading-[0.95] tracking-tight md:text-6xl">
            The board moves the <span className="italic text-forest" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}>moment</span> they tap.
          </h2>
          <p className="mt-6 max-w-md text-ink/75">
            This scoreboard is live-wired to a fake tournament so you can watch how
            it'll feel. Watch rows shuffle, watch the orange flash, watch "thru"
            tick up. Your spectators see exactly this.
          </p>

          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4 border-t border-ink/10 pt-6 font-mono text-[11px] uppercase tracking-[0.2em]">
            <div className="flex items-center gap-2 text-ink/70">
              <span className="inline-block h-2 w-2 rounded-full bg-topo" /> under par
            </div>
            <div className="flex items-center gap-2 text-ink/70">
              <span className="inline-block h-2 w-2 rounded-full bg-forest" /> even
            </div>
            <div className="flex items-center gap-2 text-ink/70">
              <span className="inline-block h-2 w-2 rounded-full bg-blueprint" /> over par
            </div>
          </div>
        </div>

        <div className="md:col-span-7">
          <div className="relative overflow-hidden rounded-[24px] border border-ink/10 bg-chalk shadow-[0_30px_60px_-30px_rgba(14,18,15,0.18)]">
            <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-topo cm-blink" />
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/75">
                  Autumn Scramble · Wingfoot CC
                </span>
              </div>
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-blueprint">
                18 holes · stroke
              </span>
            </div>

            <div className="grid grid-cols-[2.5rem_1fr_auto_auto] items-center gap-4 border-b border-ink/10 bg-bg/60 px-6 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-blueprint">
              <span>pos</span>
              <span>player</span>
              <span>thru</span>
              <span className="w-14 text-right">score</span>
            </div>

            <ol className="divide-y divide-ink/5">
              <AnimatePresence initial={false}>
                {players.map((p, i) => {
                  const tied =
                    i > 0 && players[i - 1].score === p.score
                      ? "T"
                      : players.some((q, j) => j !== i && q.score === p.score)
                        ? "T"
                        : "";
                  return (
                    <motion.li
                      key={p.id}
                      layout
                      transition={{ type: "spring", stiffness: 340, damping: 32 }}
                      className="relative grid grid-cols-[2.5rem_1fr_auto_auto] items-center gap-4 px-6 py-4"
                    >
                      {flashId === p.id && (
                        <motion.span
                          className="pointer-events-none absolute inset-0 bg-topo/15"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ duration: 0.9 }}
                        />
                      )}
                      <span className="font-mono text-sm text-ink/70 cm-tabular">
                        {tied}
                        {i + 1}
                      </span>
                      <div>
                        <div className="font-display text-xl font-medium tracking-tight">
                          {p.name}
                        </div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-blueprint">
                          {p.hometown}
                        </div>
                      </div>
                      <span className="font-mono text-sm text-ink/70 cm-tabular">
                        {p.thru === 18 ? "F" : p.thru}
                      </span>
                      <span
                        className={
                          "w-14 text-right font-mono text-xl cm-tabular " +
                          (p.score < 0
                            ? "text-topo font-semibold"
                            : p.score === 0
                              ? "text-forest"
                              : "text-ink/70")
                        }
                      >
                        {formatScore(p.score)}
                      </span>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

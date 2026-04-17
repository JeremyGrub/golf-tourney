"use client";

import { useOptimistic, useTransition } from "react";
import { updateHolePar } from "@/app/(host)/tournaments/[id]/actions";

type Hole = { id: string; hole_number: number; par: number };

export default function HoleParEditor({
  tournamentId,
  holes,
}: {
  tournamentId: string;
  holes: Hole[];
}) {
  const [isPending, startTransition] = useTransition();
  const [optimisticHoles, updateOptimistic] = useOptimistic(
    holes,
    (state, update: { id: string; par: number }) =>
      state.map((h) => (h.id === update.id ? { ...h, par: update.par } : h))
  );

  function setPar(id: string, par: number) {
    if (par < 3) par = 3;
    if (par > 6) par = 6;
    startTransition(async () => {
      updateOptimistic({ id, par });
      await updateHolePar(tournamentId, id, par);
    });
  }

  const total = optimisticHoles.reduce((a, h) => a + h.par, 0);
  const out = optimisticHoles
    .filter((h) => h.hole_number <= 9)
    .reduce((a, h) => a + h.par, 0);
  const back = total - out;

  const has18 = optimisticHoles.some((h) => h.hole_number > 9);

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-[24px] border border-ink/10 bg-chalk">
        <div className="grid grid-cols-[auto_repeat(9,minmax(3rem,1fr))_auto] items-center border-b border-ink/10 bg-bg/60 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-blueprint">
          <span>hole</span>
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className="text-center">{i + 1}</span>
          ))}
          <span className="pl-4 text-right">out</span>
        </div>
        <div className="grid grid-cols-[auto_repeat(9,minmax(3rem,1fr))_auto] items-center px-4 py-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-blueprint">par</span>
          {optimisticHoles
            .filter((h) => h.hole_number <= 9)
            .map((h) => (
              <ParCell key={h.id} hole={h} onChange={(p) => setPar(h.id, p)} />
            ))}
          <span className="pl-4 text-right font-mono text-lg text-ink cm-tabular">{out}</span>
        </div>

        {has18 && (
          <>
            <div className="grid grid-cols-[auto_repeat(9,minmax(3rem,1fr))_auto] items-center border-t border-ink/10 bg-bg/60 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-blueprint">
              <span>hole</span>
              {Array.from({ length: 9 }).map((_, i) => (
                <span key={i} className="text-center">{i + 10}</span>
              ))}
              <span className="pl-4 text-right">in</span>
            </div>
            <div className="grid grid-cols-[auto_repeat(9,minmax(3rem,1fr))_auto] items-center px-4 py-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-blueprint">par</span>
              {optimisticHoles
                .filter((h) => h.hole_number > 9)
                .map((h) => (
                  <ParCell key={h.id} hole={h} onChange={(p) => setPar(h.id, p)} />
                ))}
              <span className="pl-4 text-right font-mono text-lg text-ink cm-tabular">{back}</span>
            </div>
          </>
        )}

        <div className="flex items-center justify-between border-t border-ink/10 bg-bg/60 px-4 py-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-blueprint">
            {isPending ? "saving…" : "saved"}
          </span>
          <span className="font-mono text-sm text-ink cm-tabular">
            total par · {total}
          </span>
        </div>
      </div>
    </div>
  );
}

function ParCell({
  hole,
  onChange,
}: {
  hole: Hole;
  onChange: (par: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        aria-label={`increment hole ${hole.hole_number}`}
        onClick={() => onChange(hole.par + 1)}
        className="h-5 w-5 rounded-full text-ink/40 hover:bg-ink/5 hover:text-ink"
      >
        ▲
      </button>
      <span className="font-display text-2xl font-semibold tabular-nums text-ink cm-tabular">
        {hole.par}
      </span>
      <button
        type="button"
        aria-label={`decrement hole ${hole.hole_number}`}
        onClick={() => onChange(hole.par - 1)}
        className="h-5 w-5 rounded-full text-ink/40 hover:bg-ink/5 hover:text-ink"
      >
        ▼
      </button>
    </div>
  );
}

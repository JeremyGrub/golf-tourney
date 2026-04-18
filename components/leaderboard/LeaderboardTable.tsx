"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";
import {
  classifyStroke,
  formatRelative,
  mergeHolesAndScores,
  relativeToPar,
  thru,
  totalStrokes,
} from "@/lib/scoring/compute";
import type {
  LeaderboardParticipant,
  LeaderboardScore,
  LeaderboardSnapshot,
} from "@/lib/leaderboard";
import { useLeaderboardRealtime } from "@/lib/supabase/realtime";

type Row = {
  participant: LeaderboardParticipant;
  total: number;
  through: number;
  relative: number;
  finished: boolean;
  scores: LeaderboardScore[];
};

export default function LeaderboardTable({
  snapshot,
}: {
  snapshot: LeaderboardSnapshot;
}) {
  const [scores, setScores] = useState<LeaderboardScore[]>(snapshot.scores);
  const [flashes, setFlashes] = useState<Record<string, number>>({});

  const participantIds = useMemo(
    () => new Set(snapshot.participants.map((p) => p.id)),
    [snapshot.participants]
  );

  const onIncomingScore = useCallback((row: LeaderboardScore) => {
    setScores((prev) => {
      const next = prev.filter(
        (s) =>
          !(s.participant_id === row.participant_id && s.hole_id === row.hole_id)
      );
      next.push(row);
      return next;
    });
    setFlashes((prev) => ({ ...prev, [row.participant_id]: Date.now() }));
  }, []);

  useLeaderboardRealtime(participantIds, onIncomingScore);

  const rows: Row[] = useMemo(() => {
    const byParticipant = new Map<string, LeaderboardScore[]>();
    for (const s of scores) {
      const bucket = byParticipant.get(s.participant_id) ?? [];
      bucket.push(s);
      byParticipant.set(s.participant_id, bucket);
    }

    const computed = snapshot.participants.map<Row>((p) => {
      const pScores = byParticipant.get(p.id) ?? [];
      const merged = mergeHolesAndScores(snapshot.holes, pScores);
      const total = totalStrokes(merged);
      const through = thru(merged);
      const relative = relativeToPar(merged);
      const finished = through === snapshot.tournament.hole_count;
      return {
        participant: p,
        total,
        through,
        relative,
        finished,
        scores: pScores,
      };
    });

    // Sort: played > unplayed; lower relative > higher; more thru > fewer.
    computed.sort((a, b) => {
      if (a.through === 0 && b.through === 0) return 0;
      if (a.through === 0) return 1;
      if (b.through === 0) return -1;
      if (a.relative !== b.relative) return a.relative - b.relative;
      if (a.through !== b.through) return b.through - a.through;
      return a.participant.display_name.localeCompare(b.participant.display_name);
    });

    return computed;
  }, [scores, snapshot.holes, snapshot.participants, snapshot.tournament.hole_count]);

  const positions = useMemo(() => computePositions(rows), [rows]);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="overflow-hidden rounded-[20px] border border-ink/10 bg-chalk">
      <div className="grid grid-cols-[2rem_1fr_auto_auto_auto] items-center gap-3 border-b border-ink/10 bg-bg/60 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-blueprint md:px-6">
        <span>pos</span>
        <span>player</span>
        <span className="text-right">thru</span>
        <span className="text-right">total</span>
        <span className="text-right">to par</span>
      </div>

      <ul className="divide-y divide-ink/5">
        <AnimatePresence initial={false}>
          {rows.map((row, idx) => (
            <motion.li
              key={row.participant.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ layout: { duration: 0.4, ease: [0.2, 0, 0.2, 1] } }}
            >
              <LeaderRow
                row={row}
                position={positions[idx]}
                expanded={expandedId === row.participant.id}
                onToggle={() =>
                  setExpandedId((cur) =>
                    cur === row.participant.id ? null : row.participant.id
                  )
                }
                holes={snapshot.holes}
                flashedAt={flashes[row.participant.id]}
              />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {rows.length === 0 && (
        <div className="p-10 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-blueprint">
            no field yet
          </p>
          <p className="mt-2 text-ink/60">
            Players show up as soon as the host adds them.
          </p>
        </div>
      )}
    </div>
  );
}

function computePositions(rows: Row[]): string[] {
  const out: string[] = [];
  let lastKey: string | null = null;
  let lastRank = 0;
  rows.forEach((r, i) => {
    if (r.through === 0) {
      out.push("—");
      return;
    }
    const key = `${r.relative}`;
    if (key === lastKey) {
      out.push(`T${lastRank}`);
    } else {
      lastRank = i + 1;
      lastKey = key;
      // If the next row ties, mark as T; otherwise plain rank.
      const tiesNext = rows[i + 1] && rows[i + 1].through > 0 && rows[i + 1].relative === r.relative;
      out.push(tiesNext ? `T${lastRank}` : `${lastRank}`);
    }
  });
  return out;
}

function LeaderRow({
  row,
  position,
  expanded,
  onToggle,
  holes,
  flashedAt,
}: {
  row: Row;
  position: string;
  expanded: boolean;
  onToggle: () => void;
  holes: LeaderboardSnapshot["holes"];
  flashedAt: number | undefined;
}) {
  const isLeader = position === "1" || position === "T1";
  const relLabel =
    row.through === 0 ? "—" : formatRelative(row.relative);
  const thruLabel = row.finished ? "F" : row.through === 0 ? "—" : String(row.through);

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        className={`grid w-full grid-cols-[2rem_1fr_auto_auto_auto] items-center gap-3 px-4 py-4 text-left md:px-6 ${
          isLeader ? "bg-topo/5" : "bg-chalk hover:bg-bg/50"
        }`}
      >
        <span
          className={`font-mono text-[11px] tabular-nums cm-tabular ${
            isLeader ? "text-topo" : "text-ink/60"
          }`}
        >
          {position}
        </span>
        <span>
          <span className="block font-display text-lg font-semibold tracking-tight">
            {row.participant.display_name}
          </span>
          {row.participant.hometown && (
            <span className="block font-mono text-[10px] uppercase tracking-[0.22em] text-blueprint">
              {row.participant.hometown}
            </span>
          )}
        </span>
        <span
          className={`text-right font-mono text-sm tabular-nums cm-tabular ${
            row.finished ? "text-forest" : "text-ink/80"
          }`}
        >
          {thruLabel}
        </span>
        <span className="text-right font-mono text-sm tabular-nums cm-tabular text-ink/80">
          {row.total > 0 ? row.total : "—"}
        </span>
        <FlashCell key={flashedAt ?? 0} flash={flashedAt != null}>
          <span
            className={`text-right font-display text-xl font-semibold tabular-nums tracking-tight cm-tabular ${
              row.through === 0
                ? "text-ink/30"
                : row.relative < 0
                ? "text-topo"
                : row.relative === 0
                ? "text-ink"
                : "text-ink/70"
            }`}
          >
            {relLabel}
          </span>
        </FlashCell>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <ExpandedGrid holes={holes} scores={row.scores} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function FlashCell({
  children,
  flash,
}: {
  children: React.ReactNode;
  flash: boolean;
}) {
  return (
    <motion.span
      initial={false}
      animate={
        flash
          ? { backgroundColor: ["rgba(255,107,26,0.3)", "rgba(255,107,26,0)"] }
          : { backgroundColor: "rgba(255,107,26,0)" }
      }
      transition={{ duration: 0.9 }}
      className="ml-auto block rounded-md px-2 text-right"
    >
      {children}
    </motion.span>
  );
}

function ExpandedGrid({
  holes,
  scores,
}: {
  holes: LeaderboardSnapshot["holes"];
  scores: LeaderboardScore[];
}) {
  const merged = mergeHolesAndScores(holes, scores);
  const first9 = merged.filter((r) => r.hole_number <= 9);
  const back9 = merged.filter((r) => r.hole_number > 9);
  return (
    <div className="space-y-3 bg-bg/40 px-4 py-4 md:px-6">
      <GridRow rows={first9} label="out" />
      {back9.length > 0 && <GridRow rows={back9} label="in" />}
    </div>
  );
}

function GridRow({
  rows,
  label,
}: {
  rows: ReturnType<typeof mergeHolesAndScores>;
  label: string;
}) {
  const subtotal = rows.reduce((a, r) => a + (r.strokes ?? 0), 0);
  return (
    <div className="overflow-hidden rounded-[12px] border border-ink/10">
      <div className="grid grid-cols-[repeat(10,minmax(0,1fr))] bg-bg/60 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.22em] text-blueprint">
        {rows.map((r) => (
          <span key={r.id} className="text-center">
            {r.hole_number}
          </span>
        ))}
        <span className="text-right">{label}</span>
      </div>
      <div className="grid grid-cols-[repeat(10,minmax(0,1fr))] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.22em] text-ink/50">
        {rows.map((r) => (
          <span key={r.id} className="text-center">
            {r.par}
          </span>
        ))}
        <span className="text-right">par</span>
      </div>
      <div className="grid grid-cols-[repeat(10,minmax(0,1fr))] items-center px-3 py-2">
        {rows.map((r) => {
          const cls = classifyStroke(r.strokes, r.par);
          // Cell colour scale, best → worst. Albatross gets the deepest
          // topo so it pops even next to an eagle; triple/big step down
          // through ink tints so a rough hole reads muted, not shouty.
          const bg =
            cls === "albatross"
              ? "bg-topo-deep text-chalk"
              : cls === "eagle"
              ? "bg-topo text-chalk"
              : cls === "birdie"
              ? "bg-forest/90 text-chalk"
              : cls === "par"
              ? "bg-ink/5 text-ink"
              : cls === "bogey"
              ? "bg-blueprint/15 text-blueprint"
              : cls === "double"
              ? "bg-blueprint/25 text-blueprint"
              : cls === "triple"
              ? "bg-ink/10 text-ink/70"
              : cls === "big"
              ? "bg-ink/15 text-ink/60"
              : "bg-transparent text-ink/25";
          return (
            <span
              key={r.id}
              className={`mx-auto inline-flex h-7 w-7 items-center justify-center rounded-md text-sm font-semibold tabular-nums cm-tabular ${bg}`}
            >
              {r.strokes ?? "—"}
            </span>
          );
        })}
        <span className="text-right font-mono text-sm tabular-nums cm-tabular text-ink">
          {subtotal > 0 ? subtotal : "—"}
        </span>
      </div>
    </div>
  );
}

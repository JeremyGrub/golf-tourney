import Link from "next/link";
import { loadPlayerCard } from "@/lib/player";
import {
  classifyStroke,
  formatRelative,
  mergeHolesAndScores,
  relativeToPar,
  thru,
  totalStrokes,
} from "@/lib/scoring/compute";

export default async function ScorecardPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const card = await loadPlayerCard(token);
  const rows = mergeHolesAndScores(card.holes, card.scores);

  const rel = relativeToPar(rows);
  const through = thru(rows);
  const total = totalStrokes(rows);
  const firstUnfinished = rows.find((r) => r.strokes === null);
  const startAt = firstUnfinished?.hole_number ?? 1;

  const isLive = card.tournament.status === "live";
  const isComplete = card.tournament.status === "complete";

  const first9 = rows.filter((r) => r.hole_number <= 9);
  const back9 = rows.filter((r) => r.hole_number > 9);

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between gap-3">
        <div>
          <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-blueprint">
            · / your card
          </div>
          <h1 className="font-display text-4xl font-semibold leading-[0.95] tracking-tight">
            {card.participant.display_name}
          </h1>
          {card.participant.hometown && (
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-blueprint">
              {card.participant.hometown}
            </div>
          )}
        </div>
        <div
          className={`rounded-full border px-3 py-1 font-mono text-[9px] uppercase tracking-[0.22em] ${
            isLive
              ? "border-topo/50 bg-topo/10 text-topo"
              : isComplete
              ? "border-ink/15 bg-ink/5 text-ink/60"
              : "border-blueprint/30 bg-blueprint/10 text-blueprint"
          }`}
        >
          {isLive ? "● live" : isComplete ? "final" : "draft"}
        </div>
      </header>

      <div className="rounded-[20px] border border-ink/10 bg-chalk p-5">
        <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-blueprint">
          {card.tournament.course_name ?? card.tournament.name}
        </div>
        <div className="font-display text-xl font-semibold tracking-tight">
          {card.tournament.name}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-4">
          <Stat label="thru" value={`${through}/${card.tournament.hole_count}`} />
          <Stat label="total" value={total > 0 ? String(total) : "—"} />
          <Stat
            label="to par"
            value={through === 0 ? "—" : formatRelative(rel)}
            accent={through > 0 && rel < 0}
          />
        </div>
      </div>

      {!isLive && !isComplete && (
        <div className="rounded-[20px] border border-dashed border-ink/15 bg-chalk/40 p-5">
          <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-blueprint">
            · / not live yet
          </div>
          <p className="text-sm text-ink/70">
            Your host hasn&apos;t tipped this tournament off yet. You can open
            this page now; scoring unlocks the moment it goes live.
          </p>
        </div>
      )}

      {isLive && (
        <Link
          href={`/play/${token}/hole/${startAt}`}
          className="group flex items-center justify-between gap-3 rounded-[20px] bg-topo px-6 py-5 text-chalk shadow-[0_10px_30px_-12px_rgba(255,107,26,0.55)] hover:-translate-y-0.5 transition-transform"
        >
          <div>
            <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-chalk/70">
              {firstUnfinished ? "pick up at" : "round complete · edit"}
            </div>
            <div className="font-display text-2xl font-semibold tracking-tight">
              Hole {startAt}{" "}
              <span className="font-mono text-xs text-chalk/70">
                · par {rows.find((r) => r.hole_number === startAt)?.par ?? 4}
              </span>
            </div>
          </div>
          <span aria-hidden className="font-mono text-xl">→</span>
        </Link>
      )}

      <section>
        <div className="mb-3 flex items-end justify-between">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-blueprint">
            · / scorecard
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/50">
            tap a hole to edit
          </div>
        </div>

        <ScoreGrid
          token={token}
          label="out"
          rows={first9}
          editable={isLive}
        />
        {back9.length > 0 && (
          <div className="mt-3">
            <ScoreGrid
              token={token}
              label="in"
              rows={back9}
              editable={isLive}
            />
          </div>
        )}
      </section>

      <footer className="pt-4 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-ink/40">
        thru. · your scores sync as you tap
      </footer>
    </div>
  );
}

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-blueprint">
        {label}
      </div>
      <div
        className={`font-display text-3xl font-semibold tabular-nums tracking-tight cm-tabular ${
          accent ? "text-topo" : "text-ink"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function ScoreGrid({
  token,
  label,
  rows,
  editable,
}: {
  token: string;
  label: string;
  rows: Array<{
    id: string;
    hole_number: number;
    par: number;
    strokes: number | null;
  }>;
  editable: boolean;
}) {
  const subtotal = rows.reduce((sum, r) => sum + (r.strokes ?? 0), 0);
  return (
    <div className="overflow-hidden rounded-[16px] border border-ink/10 bg-chalk">
      <div className="grid grid-cols-[repeat(10,minmax(0,1fr))] border-b border-ink/10 bg-bg/60 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.22em] text-blueprint">
        {rows.map((r) => (
          <span key={r.id} className="text-center">
            {r.hole_number}
          </span>
        ))}
        <span className="text-right">{label}</span>
      </div>
      <div className="grid grid-cols-[repeat(10,minmax(0,1fr))] items-center px-3 py-2 font-mono text-[9px] uppercase tracking-[0.22em] text-ink/50">
        {rows.map((r) => (
          <span key={r.id} className="text-center">
            {r.par}
          </span>
        ))}
        <span className="text-right">par</span>
      </div>
      <div className="grid grid-cols-[repeat(10,minmax(0,1fr))] items-center px-3 py-3">
        {rows.map((r) => (
          <ScoreCell
            key={r.id}
            token={token}
            hole={r}
            editable={editable}
          />
        ))}
        <span className="text-right font-mono text-base tabular-nums cm-tabular text-ink">
          {subtotal > 0 ? subtotal : "—"}
        </span>
      </div>
    </div>
  );
}

function ScoreCell({
  token,
  hole,
  editable,
}: {
  token: string;
  hole: { id: string; hole_number: number; par: number; strokes: number | null };
  editable: boolean;
}) {
  const cls = classifyStroke(hole.strokes, hole.par);
  const bg =
    cls === "eagle"
      ? "bg-topo text-chalk"
      : cls === "birdie"
      ? "bg-forest/90 text-chalk"
      : cls === "par"
      ? "bg-ink/5 text-ink"
      : cls === "bogey"
      ? "bg-blueprint/15 text-blueprint"
      : cls === "double"
      ? "bg-ink/10 text-ink/70"
      : "bg-transparent text-ink/25";

  const content = hole.strokes != null ? String(hole.strokes) : "—";

  if (!editable) {
    return (
      <span
        className={`mx-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold tabular-nums cm-tabular ${bg}`}
      >
        {content}
      </span>
    );
  }

  return (
    <Link
      href={`/play/${token}/hole/${hole.hole_number}`}
      aria-label={`edit hole ${hole.hole_number}`}
      className={`mx-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold tabular-nums cm-tabular transition-transform hover:-translate-y-0.5 ${bg}`}
    >
      {content}
    </Link>
  );
}

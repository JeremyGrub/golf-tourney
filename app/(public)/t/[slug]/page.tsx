import LeaderboardTable from "@/components/leaderboard/LeaderboardTable";
import EmptyState from "@/components/ui/EmptyState";
import { loadLeaderboard } from "@/lib/leaderboard";

export const revalidate = 0;

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const snapshot = await loadLeaderboard(slug);

  const isLive = snapshot.tournament.status === "live";
  const holesPar = snapshot.holes.reduce((a, h) => a + h.par, 0);

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-16 pt-6 md:px-8">
      <header className="mb-8 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] ${
              isLive
                ? "border-topo/40 bg-topo/10 text-topo"
                : "border-ink/15 bg-ink/5 text-ink/60"
            }`}
          >
            {isLive ? (
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-topo" />
            ) : null}
            {isLive ? "live" : "final"}
          </span>
          {snapshot.tournament.course_name && (
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-blueprint">
              {snapshot.tournament.course_name}
              {snapshot.tournament.course_location
                ? ` · ${snapshot.tournament.course_location}`
                : ""}
            </span>
          )}
        </div>

        <div>
          <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-blueprint">
            · / leaderboard
          </div>
          <h1 className="font-display text-5xl font-semibold leading-[0.95] tracking-tight md:text-6xl">
            {snapshot.tournament.name}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/50">
          <span className="cm-tabular">
            {snapshot.tournament.hole_count} holes · par {holesPar}
          </span>
          <span>{snapshot.participants.length} players</span>
          {snapshot.tournament.start_date && (
            <span className="cm-tabular">{snapshot.tournament.start_date}</span>
          )}
        </div>
      </header>

      {snapshot.participants.length === 0 ? (
        <EmptyState
          eyebrow="· / no field yet"
          title="The tee box is quiet."
          body={
            isLive
              ? "Players show up here the moment the host adds them. Give it a minute, then refresh."
              : "This tournament hasn't been published yet — no field to show. Check back when it tips off."
          }
        />
      ) : (
        <>
          <LeaderboardTable snapshot={snapshot} />

          <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-ink/40">
            thru. · tap a row to expand hole-by-hole
          </p>
        </>
      )}
    </div>
  );
}

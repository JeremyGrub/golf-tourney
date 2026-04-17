import Link from "next/link";
import HostChrome from "@/components/host/HostChrome";
import TournamentTabs from "@/components/host/TournamentTabs";
import { loadOwnedTournament } from "@/lib/host";

export default async function TournamentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user, tournament } = await loadOwnedTournament(id);

  return (
    <HostChrome email={user.email ?? null}>
      <div className="border-b border-ink/10 bg-chalk/40">
        <div className="mx-auto max-w-[1280px] px-6 py-10 md:px-10 md:py-12">
          <Link
            href="/dashboard"
            className="mb-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-blueprint hover:text-ink"
          >
            ← all tournaments
          </Link>

          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="mb-2 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-blueprint">
                <StatusPill status={tournament.status} />
                <span>
                  {tournament.hole_count} holes · {tournament.format.replace("_", " ")}
                </span>
              </div>
              <h1 className="font-display text-5xl font-semibold leading-[0.95] tracking-tight md:text-6xl">
                {tournament.name}
              </h1>
              {tournament.course_name || tournament.start_date ? (
                <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-blueprint">
                  {[tournament.course_name, tournament.course_location]
                    .filter(Boolean)
                    .join(" · ")}
                  {tournament.start_date ? ` · ${tournament.start_date}` : ""}
                  {tournament.start_time ? ` · ${tournament.start_time}` : ""}
                </p>
              ) : null}
            </div>

            {tournament.status !== "draft" && (
              <Link
                href={`/t/${tournament.slug}`}
                target="_blank"
                className="group inline-flex items-center gap-2 rounded-full border border-ink/15 bg-chalk px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/80 hover:border-ink/30"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-topo cm-blink" />
                public leaderboard
                <span aria-hidden>↗</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <TournamentTabs id={id} />

      <div className="mx-auto w-full max-w-[1280px] px-6 py-10 md:px-10 md:py-14">
        {children}
      </div>
    </HostChrome>
  );
}

function StatusPill({ status }: { status: "draft" | "live" | "complete" }) {
  const map: Record<typeof status, string> = {
    draft: "bg-ink/8 text-ink/70",
    live: "bg-topo/15 text-topo",
    complete: "bg-forest/10 text-forest",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em] ${map[status]}`}
    >
      {status === "live" ? "· live" : status}
    </span>
  );
}

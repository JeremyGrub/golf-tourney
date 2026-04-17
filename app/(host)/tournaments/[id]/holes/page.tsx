import Link from "next/link";
import { loadOwnedTournament } from "@/lib/host";
import HoleParEditor from "@/components/host/HoleParEditor";

export default async function HolesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, tournament } = await loadOwnedTournament(id);

  const { data: holes } = await supabase
    .from("holes")
    .select("id, hole_number, par")
    .eq("tournament_id", id)
    .order("hole_number", { ascending: true });

  const list = holes ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.22em] text-blueprint">
            · / scorecard
          </div>
          <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            Set the par.
          </h2>
          <p className="mt-3 max-w-xl text-ink/70">
            Default is par 4 for every hole. Tap the arrows to adjust. Saves
            automatically.
          </p>
        </div>
        <Link
          href={`/tournaments/${id}/players`}
          className="group inline-flex items-center gap-3 rounded-full border border-ink/15 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/80 hover:border-ink/30"
        >
          Next · add players <span aria-hidden>→</span>
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="rounded-[24px] border border-ink/10 bg-chalk p-10 text-center">
          <p className="text-ink/70">No holes found. Something got out of sync.</p>
        </div>
      ) : (
        <HoleParEditor tournamentId={id} holes={list} />
      )}

      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-blueprint">
        {tournament.hole_count} holes · stroke play
      </p>
    </div>
  );
}

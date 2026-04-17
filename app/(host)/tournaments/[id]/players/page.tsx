import { headers } from "next/headers";
import Link from "next/link";
import { loadOwnedTournament } from "@/lib/host";
import CopyField from "@/components/host/CopyField";
import { addParticipant, deleteParticipant } from "../actions";

export default async function PlayersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await loadOwnedTournament(id);

  const { data: players } = await supabase
    .from("participants")
    .select("id, display_name, hometown, access_token, created_at")
    .eq("tournament_id", id)
    .order("created_at", { ascending: true });

  const list = players ?? [];

  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = host.startsWith("localhost") ? "http" : "https";
  const playerUrl = (token: string) => `${proto}://${host}/play/${token}`;

  const addBound = addParticipant.bind(null, id);

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.22em] text-blueprint">
            · / field
          </div>
          <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            Add your players.
          </h2>
          <p className="mt-3 max-w-xl text-ink/70">
            Each player gets a private link. Text it, email it, print it as a QR.
            No accounts, no apps to install.
          </p>
        </div>
        <Link
          href={`/tournaments/${id}/tee-times`}
          className="group inline-flex items-center gap-3 rounded-full border border-ink/15 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/80 hover:border-ink/30"
        >
          Next · tee times <span aria-hidden>→</span>
        </Link>
      </div>

      <div className="rounded-[24px] border border-ink/10 bg-chalk p-6 md:p-8">
        <form action={addBound} className="grid grid-cols-1 items-end gap-4 md:grid-cols-[1fr_1fr_auto]">
          <div>
            <label
              htmlFor="display_name"
              className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-blueprint"
            >
              player name
            </label>
            <input
              id="display_name"
              name="display_name"
              required
              placeholder="S. Koepp"
              className="w-full rounded-2xl border border-ink/15 bg-bg px-5 py-3 text-base text-ink placeholder:text-ink/30 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
            />
          </div>
          <div>
            <label
              htmlFor="hometown"
              className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-blueprint"
            >
              hometown (optional)
            </label>
            <input
              id="hometown"
              name="hometown"
              placeholder="Madison, WI"
              className="w-full rounded-2xl border border-ink/15 bg-bg px-5 py-3 text-base text-ink placeholder:text-ink/30 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-3 rounded-full bg-topo px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] text-chalk hover:-translate-y-0.5 transition-transform"
          >
            Add player <span aria-hidden>+</span>
          </button>
        </form>
      </div>

      {list.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-ink/15 bg-chalk/40 p-10 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-blueprint">
            no players yet · add your first above
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-ink/10 overflow-hidden rounded-[24px] border border-ink/10 bg-chalk">
          {list.map((p, idx) => {
            const deleteBound = deleteParticipant.bind(null, id, p.id);
            return (
              <li
                key={p.id}
                className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between md:px-8"
              >
                <div className="flex items-start gap-4">
                  <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-blueprint cm-tabular">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div className="font-display text-xl font-semibold tracking-tight">
                      {p.display_name}
                    </div>
                    {p.hometown && (
                      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-blueprint">
                        {p.hometown}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
                  <div className="w-full md:w-[28rem]">
                    <CopyField value={playerUrl(p.access_token)} label="copy link" />
                  </div>
                  <form action={deleteBound}>
                    <button
                      type="submit"
                      aria-label={`remove ${p.display_name}`}
                      className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/50 hover:text-topo"
                    >
                      remove
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-blueprint">
        {list.length} player{list.length === 1 ? "" : "s"} in the field
      </p>
    </div>
  );
}

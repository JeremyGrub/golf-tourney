import { headers } from "next/headers";
import Link from "next/link";
import { loadOwnedTournament } from "@/lib/host";
import CopyField from "@/components/host/CopyField";
import {
  completeTournament,
  deleteTournament,
  publishTournament,
  unpublishTournament,
  updateTournamentBasics,
} from "./actions";

export default async function TournamentOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, tournament } = await loadOwnedTournament(id);

  const [{ count: holeCount }, { count: playerCount }, { count: scoreCount }] =
    await Promise.all([
      supabase
        .from("holes")
        .select("id", { count: "exact", head: true })
        .eq("tournament_id", id),
      supabase
        .from("participants")
        .select("id", { count: "exact", head: true })
        .eq("tournament_id", id),
      supabase
        .from("scores")
        .select("id, participants!inner(tournament_id)", {
          count: "exact",
          head: true,
        })
        .eq("participants.tournament_id", id),
    ]);

  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = host.startsWith("localhost") ? "http" : "https";
  const publicUrl = `${proto}://${host}/t/${tournament.slug}`;

  const publishBound = publishTournament.bind(null, id);
  const unpublishBound = unpublishTournament.bind(null, id);
  const completeBound = completeTournament.bind(null, id);
  const deleteBound = deleteTournament.bind(null, id);
  const updateBound = updateTournamentBasics.bind(null, id);

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
      {/* Left / main */}
      <section className="lg:col-span-2 space-y-8">
        <Card>
          <SectionHead label="· / status" title="Where this tourney sits." />

          <div className="grid grid-cols-3 gap-6 border-y border-ink/10 py-6">
            <Stat n={String(holeCount ?? 0)} label={`of ${tournament.hole_count} holes`} />
            <Stat n={String(playerCount ?? 0)} label="players registered" />
            <Stat n={String(scoreCount ?? 0)} label="scores posted" />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {tournament.status === "draft" && (
              <form action={publishBound}>
                <button className="group inline-flex items-center gap-3 rounded-full bg-topo px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] text-chalk hover:-translate-y-0.5 transition-transform">
                  Publish & go live
                  <span aria-hidden>→</span>
                </button>
              </form>
            )}
            {tournament.status === "live" && (
              <>
                <form action={completeBound}>
                  <button className="inline-flex items-center gap-3 rounded-full bg-forest px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] text-chalk hover:bg-ink transition-colors">
                    Mark complete
                  </button>
                </form>
                <form action={unpublishBound}>
                  <button className="inline-flex items-center gap-3 rounded-full border border-ink/15 px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] text-ink/80 hover:border-ink/30">
                    Back to draft
                  </button>
                </form>
              </>
            )}
            {tournament.status === "complete" && (
              <form action={unpublishBound}>
                <button className="inline-flex items-center gap-3 rounded-full border border-ink/15 px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] text-ink/80 hover:border-ink/30">
                  Re-open (back to draft)
                </button>
              </form>
            )}
          </div>
        </Card>

        <Card>
          <SectionHead label="· / basics" title="Edit tournament details." />

          <form action={updateBound} className="space-y-6">
            <Field label="name" name="name" defaultValue={tournament.name} required />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Field
                label="course name"
                name="course_name"
                defaultValue={tournament.course_name ?? ""}
              />
              <Field
                label="location"
                name="course_location"
                defaultValue={tournament.course_location ?? ""}
              />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Field
                label="start date"
                name="start_date"
                type="date"
                defaultValue={tournament.start_date ?? ""}
              />
              <Field
                label="first tee time"
                name="start_time"
                type="time"
                defaultValue={tournament.start_time ?? ""}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-3 rounded-full bg-ink px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] text-chalk hover:bg-forest transition-colors"
              >
                Save changes
              </button>
            </div>
          </form>
        </Card>
      </section>

      {/* Right rail */}
      <aside className="space-y-8">
        <Card>
          <SectionHead label="· / share" title="Public leaderboard." />
          {tournament.status === "draft" ? (
            <p className="text-ink/70">
              Publish to activate the public URL. Until then the board is locked
              to you.
            </p>
          ) : (
            <>
              <CopyField value={publicUrl} />
              <Link
                href={`/t/${tournament.slug}`}
                target="_blank"
                className="mt-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/70 hover:text-ink"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-topo cm-blink" />
                open leaderboard ↗
              </Link>
            </>
          )}
        </Card>

        <Card>
          <SectionHead label="· / next up" title="Keep building." />
          <ul className="space-y-3">
            <ChecklistItem
              href={`/tournaments/${id}/holes`}
              label="Set par for each hole"
              done={(holeCount ?? 0) >= tournament.hole_count}
            />
            <ChecklistItem
              href={`/tournaments/${id}/players`}
              label="Add at least one player"
              done={(playerCount ?? 0) > 0}
            />
            <ChecklistItem
              href={`/tournaments/${id}/tee-times`}
              label="Line up tee times"
              done={false}
            />
          </ul>
        </Card>

        <Card tone="danger">
          <SectionHead label="· / danger zone" title="Delete this tournament." />
          <p className="mb-4 text-ink/70">
            Removes the tournament and all its players + scores. Can&apos;t be undone.
          </p>
          <form action={deleteBound}>
            <button className="inline-flex items-center gap-2 rounded-full border border-topo/40 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-topo hover:bg-topo/10">
              Delete tournament
            </button>
          </form>
        </Card>
      </aside>
    </div>
  );
}

function Card({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <div
      className={
        "rounded-[28px] border p-8 md:p-10 " +
        (tone === "danger"
          ? "border-topo/20 bg-topo/[0.03]"
          : "border-ink/10 bg-chalk")
      }
    >
      {children}
    </div>
  );
}

function SectionHead({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-6">
      <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.22em] text-blueprint">
        {label}
      </div>
      <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight">
        {title}
      </h2>
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="font-display text-4xl font-semibold leading-none tracking-tight cm-tabular">
        {n}
      </div>
      <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-blueprint">
        {label}
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-blueprint"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="w-full rounded-2xl border border-ink/15 bg-bg px-5 py-3 font-sans text-base text-ink placeholder:text-ink/30 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
      />
    </div>
  );
}

function ChecklistItem({
  label,
  href,
  done,
}: {
  label: string;
  href: string;
  done: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        className="group flex items-center justify-between gap-4 rounded-xl border border-ink/10 bg-bg/50 px-4 py-3 hover:border-ink/25"
      >
        <div className="flex items-center gap-3">
          <span
            className={
              "inline-flex h-5 w-5 items-center justify-center rounded-full border " +
              (done
                ? "border-forest bg-forest text-chalk"
                : "border-ink/25 text-transparent")
            }
          >
            ✓
          </span>
          <span className={done ? "text-ink/50 line-through" : "text-ink"}>{label}</span>
        </div>
        <span
          aria-hidden
          className="text-ink/30 transition-transform group-hover:translate-x-1"
        >
          →
        </span>
      </Link>
    </li>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HostChrome from "@/components/host/HostChrome";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("id, name, slug, course_name, start_date, hole_count, status, created_at")
    .eq("host_id", user.id)
    .order("created_at", { ascending: false });

  const list = tournaments ?? [];

  return (
    <HostChrome email={user.email ?? null}>
      <div className="mx-auto w-full max-w-[1280px] px-6 py-12 md:px-10 md:py-16">
        <div className="mb-10 flex flex-col items-start justify-between gap-6 md:mb-14 md:flex-row md:items-end">
          <div>
            <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-blueprint">
              · / your tournaments
            </div>
            <h1 className="font-display text-5xl font-semibold leading-[0.95] tracking-tight md:text-6xl">
              Dashboard.
            </h1>
          </div>
          <Link
            href="/tournaments/new"
            className="group inline-flex items-center gap-3 rounded-full bg-topo px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] text-chalk transition-transform hover:-translate-y-0.5"
          >
            New tournament
            <span aria-hidden>→</span>
          </Link>
        </div>

        {list.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {list.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/tournaments/${t.id}`}
                  className="group relative block overflow-hidden rounded-3xl border border-ink/10 bg-chalk p-6 transition-colors hover:border-ink/30"
                >
                  <div className="mb-6 flex items-center justify-between">
                    <StatusBadge status={t.status} />
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-blueprint">
                      {t.hole_count} holes
                    </span>
                  </div>

                  <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight">
                    {t.name}
                  </h2>
                  <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-blueprint">
                    {t.course_name ?? "course tbd"}
                    {t.start_date ? ` · ${t.start_date}` : ""}
                  </div>

                  <div className="mt-8 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">
                    <span>/{t.slug}</span>
                    <span aria-hidden className="text-ink/40 transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </HostChrome>
  );
}

function StatusBadge({ status }: { status: "draft" | "live" | "complete" }) {
  const map: Record<typeof status, { label: string; cls: string }> = {
    draft: { label: "draft", cls: "bg-ink/8 text-ink/70" },
    live: { label: "· live", cls: "bg-topo/15 text-topo" },
    complete: { label: "final", cls: "bg-forest/10 text-forest" },
  };
  const { label, cls } = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] ${cls}`}
    >
      {label}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-ink/10 bg-chalk p-10 md:p-16">
      <div className="absolute inset-0 cm-contours opacity-40 pointer-events-none" aria-hidden />
      <div className="relative max-w-lg">
        <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-blueprint">
          · / empty card
        </div>
        <h2 className="font-display text-4xl font-semibold leading-[0.95] tracking-tight">
          No tourneys yet. <span className="italic text-forest" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}>Let&apos;s fix that.</span>
        </h2>
        <p className="mt-4 text-ink/70">
          Set up your first event in about four minutes. You can always come back
          and edit the par, the field, and the tee sheet.
        </p>
        <Link
          href="/tournaments/new"
          className="mt-8 inline-flex items-center gap-3 rounded-full bg-topo px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] text-chalk hover:-translate-y-0.5 transition-transform"
        >
          Start your first tournament <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}

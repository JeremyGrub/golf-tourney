import Link from "next/link";
import { loadOwnedTournament } from "@/lib/host";

export default async function TeeTimesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await loadOwnedTournament(id);

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.22em] text-blueprint">
          · / sheet
        </div>
        <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
          Line up tee times.
        </h2>
        <p className="mt-3 max-w-xl text-ink/70">
          Coming up next — drag players into groups and assign a tee time per
          group. For now, your tournament runs fine without one; players can
          post scores any time they tee off.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-[24px] border border-dashed border-ink/15 bg-chalk/40 p-10">
        <div className="absolute inset-0 cm-contours opacity-30 pointer-events-none" aria-hidden />
        <div className="relative max-w-md">
          <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-blueprint">
            · / placeholder
          </div>
          <h3 className="font-display text-2xl font-semibold leading-tight tracking-tight">
            Tee sheet coming soon.
          </h3>
          <p className="mt-3 text-ink/70">
            The tee-sheet builder is in the next slice. Until then, you can still
            publish and run a tournament — players just tee off whenever their
            group is ready.
          </p>
          <Link
            href={`/tournaments/${id}`}
            className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/80 hover:text-ink"
          >
            ← back to overview
          </Link>
        </div>
      </div>
    </div>
  );
}

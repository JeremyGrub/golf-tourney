import { loadOwnedTournament } from "@/lib/host";
import EmptyState from "@/components/ui/EmptyState";

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

      <EmptyState
        eyebrow="· / next slice"
        title="Tee sheet is on the way."
        body="The group-and-time builder ships in the next slice. Until then, you can still publish and run a tournament — players just tee off whenever their group is ready."
        cta={{
          href: `/tournaments/${id}`,
          label: "Back to overview",
          tone: "outline",
          arrow: "left",
        }}
      />
    </div>
  );
}

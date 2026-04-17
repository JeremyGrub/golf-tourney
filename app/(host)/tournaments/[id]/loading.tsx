// Sits inside the tournament layout (which has its own header), so we only
// need to fill the inner content slot. Generic enough to work for the
// overview, players, holes, and tee-times tabs.
export default function TournamentSectionLoading() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="cm-skel h-3 w-40" />
        <div className="cm-skel h-9 w-32 rounded-full" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-ink/10 bg-chalk p-5"
            style={{ opacity: 1 - i * 0.1 }}
          >
            <div className="cm-skel mb-3 h-3 w-20" />
            <div className="cm-skel mb-2 h-6 w-3/4 rounded-md" />
            <div className="cm-skel h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

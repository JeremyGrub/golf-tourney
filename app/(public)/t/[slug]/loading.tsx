// Mirrors the shape of LeaderboardPage so the layout doesn't shift when the
// real data lands. Five skeleton rows is roughly average for a casual outing.
export default function LeaderboardLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-16 pt-6 md:px-8">
      <header className="mb-8 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="cm-skel h-6 w-16 rounded-full" />
          <div className="cm-skel h-3 w-44" />
        </div>
        <div>
          <div className="cm-skel mb-2 h-3 w-32" />
          <div className="cm-skel h-12 w-3/4 rounded-md md:h-14" />
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <div className="cm-skel h-3 w-28" />
          <div className="cm-skel h-3 w-20" />
          <div className="cm-skel h-3 w-24" />
        </div>
      </header>

      <div className="overflow-hidden rounded-[20px] border border-ink/10 bg-chalk">
        <div className="grid grid-cols-[2rem_1fr_3rem_3rem_3rem] items-center gap-3 border-b border-ink/10 bg-bg/50 px-4 py-3">
          <div className="cm-skel h-2.5 w-4" />
          <div className="cm-skel h-2.5 w-12" />
          <div className="cm-skel h-2.5 w-6 justify-self-end" />
          <div className="cm-skel h-2.5 w-6 justify-self-end" />
          <div className="cm-skel h-2.5 w-6 justify-self-end" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[2rem_1fr_3rem_3rem_3rem] items-center gap-3 border-b border-ink/5 px-4 py-4 last:border-0"
            style={{ opacity: 1 - i * 0.13 }}
          >
            <div className="cm-skel h-4 w-5" />
            <div className="flex flex-col gap-1.5">
              <div className="cm-skel h-4 w-32 md:w-44" />
              <div className="cm-skel h-2.5 w-20" />
            </div>
            <div className="cm-skel h-5 w-8 justify-self-end" />
            <div className="cm-skel h-5 w-8 justify-self-end" />
            <div className="cm-skel h-5 w-8 justify-self-end" />
          </div>
        ))}
      </div>

      <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-[0.32em] text-blueprint/70">
        plotting the field
      </p>
    </div>
  );
}

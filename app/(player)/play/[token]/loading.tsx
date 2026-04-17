// Mirrors ScorecardPage shape (header, stat strip, primary CTA, two 9-hole
// grids). Lives inside (player)/layout so the cream background + grid texture
// already wrap us.
export default function ScorecardLoading() {
  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <div className="cm-skel h-3 w-20" />
          <div className="cm-skel h-9 w-44 rounded-md" />
          <div className="cm-skel h-3 w-24" />
        </div>
        <div className="cm-skel h-6 w-14 rounded-full" />
      </header>

      <div className="rounded-[20px] border border-ink/10 bg-chalk p-5">
        <div className="cm-skel mb-2 h-3 w-28" />
        <div className="cm-skel h-5 w-48 rounded-md" />
        <div className="mt-5 grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="cm-skel h-3 w-10" />
              <div className="cm-skel h-7 w-12 rounded-md" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[20px] bg-topo/30 p-5">
        <div className="cm-skel mb-2 h-3 w-20 bg-chalk/30" />
        <div className="cm-skel h-7 w-40 rounded-md bg-chalk/30" />
      </div>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <div className="cm-skel h-3 w-20" />
          <div className="cm-skel h-3 w-24" />
        </div>
        <SkelGrid />
        <div className="mt-3">
          <SkelGrid />
        </div>
      </section>
    </div>
  );
}

function SkelGrid() {
  return (
    <div className="overflow-hidden rounded-[16px] border border-ink/10 bg-chalk">
      <div className="grid grid-cols-[repeat(10,minmax(0,1fr))] items-center border-b border-ink/10 bg-bg/60 px-3 py-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="cm-skel mx-auto h-2 w-3" />
        ))}
      </div>
      <div className="grid grid-cols-[repeat(10,minmax(0,1fr))] items-center px-3 py-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="cm-skel mx-auto h-2 w-3" />
        ))}
      </div>
      <div className="grid grid-cols-[repeat(10,minmax(0,1fr))] items-center px-3 py-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="cm-skel mx-auto h-7 w-7 rounded-md" />
        ))}
      </div>
    </div>
  );
}

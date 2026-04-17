// Root-level fallback. Specific routes should override this with a
// shape-matching skeleton; this is just a low-key holding pattern so a slow
// nav never lands on a blank page.
export default function RootLoading() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center px-6">
      <div className="absolute inset-0 cm-grid-fine pointer-events-none opacity-50" aria-hidden />
      <div className="relative flex flex-col items-center gap-3">
        <span className="relative inline-flex h-2.5 w-2.5">
          <span className="absolute inset-0 animate-ping rounded-full bg-topo opacity-60" />
          <span className="relative h-2.5 w-2.5 rounded-full bg-topo" />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-blueprint">
          loading the course
        </span>
      </div>
    </div>
  );
}

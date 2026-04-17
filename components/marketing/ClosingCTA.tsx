import Link from "next/link";

export default function ClosingCTA() {
  return (
    <section id="start" className="relative overflow-hidden border-t border-ink/10 bg-forest text-chalk">
      <div className="pointer-events-none absolute inset-0 opacity-[0.18]">
        <svg viewBox="0 0 1200 600" className="h-full w-full" aria-hidden>
          {Array.from({ length: 16 }).map((_, i) => {
            const r = 40 + i * 48;
            return (
              <ellipse
                key={i}
                cx="900"
                cy="520"
                rx={r * 1.8}
                ry={r * 0.7}
                fill="none"
                stroke="#EFEBDD"
                strokeWidth={1}
              />
            );
          })}
        </svg>
      </div>

      <div className="relative mx-auto grid max-w-[1400px] grid-cols-1 items-end gap-10 px-6 py-28 md:grid-cols-12 md:px-10 md:py-36">
        <div className="md:col-span-8">
          <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-chalk/70">
            · / the 1st tee
          </div>
          <h2 className="font-display text-6xl font-semibold leading-[0.9] tracking-tight md:text-8xl">
            Your next tourney
            <br />
            <span className="italic" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}>
              is twelve clicks away.
            </span>
          </h2>
        </div>

        <div className="md:col-span-4 md:pl-6">
          <p className="mb-8 max-w-sm text-chalk/80">
            Free while we're in beta. Keep your scorecards. Keep the receipts.
            Your players keep their dignity.
          </p>
          <Link
            href="/dashboard"
            className="group inline-flex w-full items-center justify-between gap-4 rounded-full bg-topo px-6 py-5 font-mono text-xs uppercase tracking-[0.2em] text-chalk transition-transform hover:-translate-y-0.5"
          >
            Start a tournament
            <span aria-hidden>→</span>
          </Link>
          <div className="mt-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-chalk/60">
            <span className="h-1.5 w-1.5 rounded-full bg-topo cm-blink" />
            no credit card · no install
          </div>
        </div>
      </div>
    </section>
  );
}

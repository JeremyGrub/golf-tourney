"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import HeroCourseFallback from "@/components/three/HeroCourseFallback";

const HeroCourse = dynamic(() => import("@/components/three/HeroCourse"), {
  ssr: false,
  loading: () => <HeroCourseFallback />,
});

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 cm-grid-fine opacity-40 pointer-events-none" aria-hidden />

      <div className="relative mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-6 pt-10 pb-20 md:grid-cols-12 md:gap-8 md:px-10 md:pt-16 md:pb-28">
        {/* left copy column */}
        <div className="md:col-span-7 md:pr-6">
          <div className="mb-8 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-blueprint">
            <span className="h-px w-10 bg-blueprint/70" />
            A new way to run the tournament
          </div>

          <h1 className="font-display text-[clamp(3.2rem,8.2vw,7.8rem)] leading-[0.92] tracking-[-0.02em] text-ink">
            <span className="block">Keep the card.</span>
            <span className="block italic text-forest" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}>
              Lose the paper.
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink/75 md:text-xl">
            Spin up a tournament in minutes. Text your players a link. Watch the
            leaderboard move in real time as scores roll in, hole by hole.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center justify-between gap-6 rounded-full bg-topo px-6 py-4 font-mono text-xs uppercase tracking-[0.2em] text-chalk transition-transform hover:-translate-y-0.5"
            >
              Start a tournament
              <span aria-hidden className="text-base leading-none">→</span>
            </Link>
            <a
              href="#demo"
              className="inline-flex items-center gap-2 px-6 py-4 font-mono text-xs uppercase tracking-[0.2em] text-ink/80 hover:text-ink"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-topo cm-blink" />
              Watch a live demo
            </a>
          </div>

          {/* stat strip */}
          <div className="mt-16 grid max-w-xl grid-cols-3 gap-6 border-t border-ink/10 pt-6">
            <Stat n="9/18" label="flexible hole counts" />
            <Stat n="0" label="apps to install" />
            <Stat n="<1s" label="leaderboard latency" />
          </div>
        </div>

        {/* right 3D column */}
        <div className="relative md:col-span-5">
          <div className="relative aspect-square w-full overflow-hidden rounded-[28px] border border-ink/10 bg-chalk/50 md:aspect-[4/5]">
            <div className="absolute inset-0 cm-contours opacity-60 pointer-events-none" aria-hidden />
            <div className="absolute inset-0">
              <HeroCourse />
            </div>

            {/* overlay corner tags */}
            <div className="absolute left-4 top-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/70">
              <span className="h-1.5 w-1.5 rounded-full bg-topo cm-blink" />
              live · hole 14
            </div>
            <div className="absolute right-4 top-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/70">
              N 41° 52′ / W 87° 37′
            </div>

            {/* leaderboard bug */}
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-chalk/95 p-4 shadow-[0_1px_0_0_rgba(14,18,15,0.05),0_20px_40px_-20px_rgba(14,18,15,0.15)] backdrop-blur">
              <div className="mb-2 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-blueprint">
                <span>leader</span>
                <span>thru 14</span>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="font-display text-2xl font-semibold tracking-tight">
                  R. Ortiz
                </div>
                <div className="font-mono text-3xl font-semibold text-topo-deep cm-tabular">
                  −4
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="font-display text-3xl font-semibold tracking-tight text-ink cm-tabular">
        {n}
      </div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-blueprint">
        {label}
      </div>
    </div>
  );
}

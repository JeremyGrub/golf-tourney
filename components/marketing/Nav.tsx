import Link from "next/link";

export default function Nav() {
  return (
    <header className="relative z-20 w-full">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 md:px-10">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-display text-3xl font-semibold tracking-tight text-ink">
            thru<span className="text-topo">.</span>
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-blueprint md:inline">
            live golf scoring
          </span>
        </Link>

        <nav className="hidden items-center gap-8 font-mono text-xs uppercase tracking-[0.18em] text-ink/70 md:flex">
          <Link href="#how" className="hover:text-ink">How it works</Link>
          <Link href="#demo" className="hover:text-ink">Live demo</Link>
          <Link href="#start" className="hover:text-ink">For hosts</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden font-mono text-xs uppercase tracking-[0.18em] text-ink/70 hover:text-ink md:block"
          >
            Sign in
          </Link>
          <Link
            href="/dashboard"
            className="group relative inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] text-chalk transition-colors hover:bg-forest"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-topo cm-blink" />
            Start a tournament
          </Link>
        </div>
      </div>
      <div className="h-px w-full bg-ink/10" />
    </header>
  );
}

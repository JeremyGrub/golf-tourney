export default function Footer() {
  return (
    <footer className="relative border-t border-ink/10 bg-bg">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between md:px-10">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-2xl font-semibold tracking-tight">
            thru<span className="text-topo">.</span>
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-blueprint">
            © {new Date().getFullYear()} · built for the 19th hole
          </span>
        </div>
        <div className="flex gap-6 font-mono text-[11px] uppercase tracking-[0.22em] text-ink/70">
          <a href="#" className="hover:text-ink">Privacy</a>
          <a href="#" className="hover:text-ink">Terms</a>
          <a href="mailto:hi@thru.golf" className="hover:text-ink">Contact</a>
        </div>
      </div>
    </footer>
  );
}

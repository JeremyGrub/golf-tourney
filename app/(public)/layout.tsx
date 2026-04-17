import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <div className="absolute inset-0 cm-grid pointer-events-none opacity-[0.04]" aria-hidden />
      <header className="relative z-10 flex items-center justify-between px-5 py-5 md:px-10">
        <Link href="/" className="font-display text-2xl tracking-tight">
          thru<span className="text-topo">.</span>
        </Link>
        <Link
          href="/"
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60 hover:text-ink"
        >
          start a tournament →
        </Link>
      </header>
      <main className="relative z-10 flex-1">{children}</main>
    </div>
  );
}

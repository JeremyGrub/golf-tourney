import Link from "next/link";

export default function HostChrome({
  email,
  children,
}: {
  email: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="border-b border-ink/10 bg-chalk/60 backdrop-blur">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4 md:px-10">
          <div className="flex items-baseline gap-4">
            <Link href="/dashboard" className="font-display text-2xl font-semibold tracking-tight">
              thru<span className="text-topo">.</span>
            </Link>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-blueprint md:inline">
              host console
            </span>
          </div>

          {email ? (
            <div className="flex items-center gap-4">
              <span className="hidden font-mono text-[11px] uppercase tracking-[0.18em] text-ink/60 md:inline">
                {email}
              </span>
              <form action="/auth/signout" method="post">
                <button className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink/70 hover:text-ink">
                  sign out
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}

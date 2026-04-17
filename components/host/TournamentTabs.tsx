"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TournamentTabs({ id }: { id: string }) {
  const pathname = usePathname();
  const base = `/tournaments/${id}`;

  const tabs = [
    { href: `${base}`, label: "Overview" },
    { href: `${base}/holes`, label: "Holes" },
    { href: `${base}/players`, label: "Players" },
    { href: `${base}/tee-times`, label: "Tee times" },
  ];

  return (
    <nav className="border-b border-ink/10">
      <div className="mx-auto flex max-w-[1280px] gap-6 overflow-x-auto px-6 md:px-10">
        {tabs.map((tab) => {
          const active =
            tab.href === base
              ? pathname === base
              : pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={
                "relative px-1 py-4 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors " +
                (active ? "text-ink" : "text-ink/50 hover:text-ink/80")
              }
            >
              {tab.label}
              {active && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 bg-topo" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

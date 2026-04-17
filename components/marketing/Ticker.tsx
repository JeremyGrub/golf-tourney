const TICKER_ITEMS = [
  { name: "R. ORTIZ", thru: "THRU 12", score: "-4" },
  { name: "S. KOEPP", thru: "THRU 11", score: "-3" },
  { name: "J. MALLOY", thru: "THRU 14", score: "-2" },
  { name: "M. TRAN", thru: "THRU 10", score: "E" },
  { name: "D. OKAFOR", thru: "THRU 13", score: "+1" },
  { name: "L. NOVAK", thru: "THRU 9", score: "+2" },
  { name: "A. SINGH", thru: "THRU 12", score: "+3" },
  { name: "C. HEATH", thru: "THRU 11", score: "+5" },
];

export default function Ticker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="relative w-full overflow-hidden border-y border-ink/15 bg-chalk/60 py-3">
      <div className="flex gap-10 cm-marquee whitespace-nowrap font-mono text-xs uppercase tracking-[0.15em] text-ink/80">
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-3 cm-tabular">
            <span className="text-topo">●</span>
            <span>{item.name}</span>
            <span className="text-blueprint">{item.thru}</span>
            <span
              className={
                item.score.startsWith("-")
                  ? "text-topo font-semibold"
                  : item.score === "E"
                    ? "text-forest"
                    : "text-ink/70"
              }
            >
              {item.score}
            </span>
            <span className="text-rough">·</span>
          </div>
        ))}
      </div>
    </div>
  );
}

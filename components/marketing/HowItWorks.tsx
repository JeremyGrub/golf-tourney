const STEPS = [
  {
    n: "01",
    title: "Set the course.",
    body: "Drop in your tournament name, pick 9 or 18, set par per hole, and line up tee times.",
    detail: "≈ 4 minutes",
  },
  {
    n: "02",
    title: "Hand out links.",
    body: "Every player gets their own private scorecard URL. Text it, email it, print a QR. No sign-up, no app.",
    detail: "one tap to open",
  },
  {
    n: "03",
    title: "Watch it move.",
    body: "Scores sync the moment a player taps +. The public leaderboard re-sorts with every stroke.",
    detail: "sub-second updates",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="relative border-y border-ink/10 bg-chalk/40">
      <div className="mx-auto max-w-[1400px] px-6 py-24 md:px-10 md:py-32">
        <div className="mb-16 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-blueprint">
              · / the route
            </div>
            <h2 className="max-w-3xl font-display text-5xl font-semibold leading-[0.95] tracking-tight md:text-6xl">
              Three steps. Then you hit the first tee.
            </h2>
          </div>
          <p className="max-w-sm text-ink/70">
            No spreadsheets, no pencils that snap on the cart, no arguing about
            who had what on 13.
          </p>
        </div>

        <ol className="grid grid-cols-1 gap-0 border-t border-ink/10 md:grid-cols-3 md:gap-0">
          {STEPS.map((s, i) => (
            <li
              key={s.n}
              className={
                "relative flex flex-col gap-6 px-0 py-10 md:px-8 md:py-12 " +
                (i < STEPS.length - 1
                  ? "border-b border-ink/10 md:border-b-0 md:border-r"
                  : "")
              }
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-topo">
                  {s.n}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-blueprint">
                  {s.detail}
                </span>
              </div>
              <h3 className="font-display text-3xl font-semibold leading-tight tracking-tight">
                {s.title}
              </h3>
              <p className="text-ink/75">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

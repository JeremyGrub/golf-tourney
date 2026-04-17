import Link from "next/link";

// loadPlayerCard() calls notFound() when the token isn't a UUID, when the RPC
// errors, or when no row matches. From the player's POV that's all "your link
// didn't work" — keep the copy friendly.
export default function ScorecardNotFound() {
  return (
    <div className="space-y-6">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-blueprint">
        · / your card
      </div>
      <h1 className="font-display text-4xl font-semibold leading-[0.95] tracking-tight">
        This link didn&apos;t work.
      </h1>
      <div className="rounded-[20px] border border-ink/10 bg-chalk p-5">
        <p className="text-sm text-ink/70">
          The card we expected to find here doesn&apos;t exist. A few things to
          try:
        </p>
        <ul className="mt-3 space-y-2 text-sm text-ink/70">
          <li className="flex gap-2">
            <span aria-hidden className="text-topo">·</span>
            Open the original message — links can get cut off when they wrap.
          </li>
          <li className="flex gap-2">
            <span aria-hidden className="text-topo">·</span>
            Ask the host to resend your link from the players page.
          </li>
          <li className="flex gap-2">
            <span aria-hidden className="text-topo">·</span>
            If the round just ended, your scorecard may have been archived.
          </li>
        </ul>
      </div>
      <Link
        href="/"
        className="inline-flex items-center gap-3 rounded-full border border-ink/15 bg-chalk px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] text-ink/80 hover:border-ink/30 hover:text-ink"
      >
        <span aria-hidden>←</span> Back to home
      </Link>
    </div>
  );
}

import Link from "next/link";

/**
 * Shared empty-state shell for screens that legitimately have nothing to show
 * yet (dashboard with no tournaments, tee sheet with no groups, leaderboard
 * before a player is added, etc.).
 *
 * The illustration is a hand-drawn hole diagram — tee box, dashed fairway
 * arcing past a bunker, a green with a flag — rendered in blueprint/forest
 * line work on cream. It's the Course Map motif distilled into ~220px wide
 * so every "nothing here yet" moment reads like an editorial beat instead
 * of a dead screen.
 *
 * Keep it restrained: one illustration, one heading, one body line, one CTA.
 * Any more and it stops feeling like a pause.
 */
export default function EmptyState({
  eyebrow,
  title,
  body,
  cta,
  size = "hero",
  variant = "hole",
  className = "",
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  cta?: {
    href: string;
    label: string;
    tone?: "topo" | "ink" | "outline";
    arrow?: "right" | "left" | "none";
  };
  size?: "hero" | "inline";
  variant?: "hole" | "flag";
  className?: string;
}) {
  const padding =
    size === "hero" ? "p-10 md:p-14" : "p-8 md:p-10";
  const titleSize =
    size === "hero"
      ? "font-display text-4xl md:text-5xl font-semibold leading-[0.95] tracking-tight"
      : "font-display text-2xl md:text-3xl font-semibold leading-tight tracking-tight";
  const bodySize = size === "hero" ? "text-ink/70" : "text-sm text-ink/70";

  const ctaTone = cta?.tone ?? "topo";
  const ctaCls =
    ctaTone === "topo"
      ? "bg-topo text-chalk hover:-translate-y-0.5 transition-transform"
      : ctaTone === "ink"
      ? "bg-ink text-chalk hover:bg-forest transition-colors"
      : "border border-ink/15 text-ink/80 hover:border-ink/30";

  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border border-ink/10 bg-chalk ${padding} ${className}`}
    >
      <div
        className="absolute inset-0 cm-contours opacity-40 pointer-events-none"
        aria-hidden
      />
      <div className="relative flex flex-col items-start gap-8 md:flex-row md:items-center md:gap-12">
        <div className="flex-shrink-0">
          {variant === "hole" ? <HoleMark /> : <FlagMark />}
        </div>
        <div className="flex-1 max-w-lg">
          {eyebrow && (
            <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-blueprint">
              {eyebrow}
            </div>
          )}
          <h2 className={titleSize}>{title}</h2>
          {body && <p className={`mt-4 ${bodySize}`}>{body}</p>}
          {cta && (
            <Link
              href={cta.href}
              className={`mt-7 inline-flex items-center gap-3 rounded-full px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] ${ctaCls}`}
            >
              {cta.arrow === "left" && <span aria-hidden>←</span>}
              {cta.label}
              {(cta.arrow ?? "right") === "right" && <span aria-hidden>→</span>}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Blueprint-style hole diagram. Tee box (lower-left), an arcing dashed
 * fairway, an oval bunker, a circular green, and a flagstick leaning
 * into the wind. Stroke widths are chunky and honest (0.8–1.2px at 1x)
 * so the thing reads on a retina phone without anti-aliasing mush.
 */
function HoleMark() {
  return (
    <svg
      width="180"
      height="180"
      viewBox="0 0 180 180"
      fill="none"
      aria-hidden
      className="overflow-visible"
    >
      {/* Faint blueprint grid — matches cm-grid-fine elsewhere */}
      <defs>
        <pattern id="blueprint-grid" width="12" height="12" patternUnits="userSpaceOnUse">
          <path
            d="M 12 0 L 0 0 0 12"
            fill="none"
            stroke="var(--cm-blueprint)"
            strokeOpacity="0.12"
            strokeWidth="0.5"
          />
        </pattern>
      </defs>

      <rect width="180" height="180" fill="url(#blueprint-grid)" />

      {/* Fairway shape — an organic blob following the ball's path */}
      <path
        d="M 30 150 Q 20 110 60 90 Q 100 70 140 45"
        fill="none"
        stroke="var(--cm-forest)"
        strokeOpacity="0.22"
        strokeWidth="22"
        strokeLinecap="round"
      />

      {/* Dashed centerline — the intended ball arc */}
      <path
        d="M 30 150 Q 20 110 60 90 Q 100 70 140 45"
        fill="none"
        stroke="var(--cm-blueprint)"
        strokeWidth="1.2"
        strokeDasharray="3 4"
        strokeLinecap="round"
        strokeOpacity="0.55"
      />

      {/* Tee box — a small rectangle with two tee markers */}
      <rect
        x="20"
        y="144"
        width="22"
        height="14"
        rx="2"
        fill="var(--cm-chalk)"
        stroke="var(--cm-ink)"
        strokeWidth="1.1"
      />
      <circle cx="26" cy="151" r="1.6" fill="var(--cm-topo)" />
      <circle cx="36" cy="151" r="1.6" fill="var(--cm-topo)" />

      {/* Bunker — a soft kidney shape */}
      <path
        d="M 75 115 Q 82 105 94 108 Q 100 115 92 121 Q 80 124 75 115 Z"
        fill="var(--cm-rough)"
        fillOpacity="0.55"
        stroke="var(--cm-ink)"
        strokeWidth="0.9"
        strokeDasharray="1.5 2"
        strokeOpacity="0.7"
      />

      {/* Green — circle */}
      <circle
        cx="140"
        cy="45"
        r="18"
        fill="var(--cm-forest)"
        fillOpacity="0.14"
        stroke="var(--cm-forest)"
        strokeWidth="1.2"
      />
      {/* Green contour ring */}
      <circle
        cx="140"
        cy="45"
        r="11"
        fill="none"
        stroke="var(--cm-forest)"
        strokeWidth="0.7"
        strokeDasharray="1.5 2.5"
        strokeOpacity="0.7"
      />

      {/* Cup */}
      <circle cx="140" cy="45" r="2" fill="var(--cm-ink)" />

      {/* Flagstick — leaning slightly right, flag pointing left */}
      <line
        x1="140"
        y1="45"
        x2="143"
        y2="18"
        stroke="var(--cm-ink)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M 143 19 L 128 22 L 143 27 Z"
        fill="var(--cm-topo)"
        stroke="var(--cm-topo)"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />

      {/* Compass mark */}
      <g transform="translate(158 162)">
        <circle r="8" fill="none" stroke="var(--cm-blueprint)" strokeWidth="0.7" strokeOpacity="0.5" />
        <line x1="0" y1="-6" x2="0" y2="6" stroke="var(--cm-blueprint)" strokeWidth="0.7" strokeOpacity="0.5" />
        <line x1="-6" y1="0" x2="6" y2="0" stroke="var(--cm-blueprint)" strokeWidth="0.7" strokeOpacity="0.5" />
        <text
          x="0"
          y="-9"
          fontSize="5"
          fontFamily="var(--font-mono, ui-monospace), monospace"
          fill="var(--cm-blueprint)"
          textAnchor="middle"
          fillOpacity="0.7"
        >
          N
        </text>
      </g>
    </svg>
  );
}

/**
 * Alternate mark for smaller / secondary empty states — a lone flag on a
 * contour fragment. Reads at smaller sizes where the full hole mark would
 * feel cluttered.
 */
function FlagMark() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden
    >
      {/* Concentric contour lines */}
      <g stroke="var(--cm-blueprint)" strokeOpacity="0.35" fill="none">
        <path d="M 60 100 Q 20 90 25 60 Q 30 30 70 30 Q 100 40 95 75 Q 90 110 60 100 Z" strokeWidth="0.8" strokeDasharray="2 2" />
        <path d="M 60 90 Q 35 82 38 62 Q 42 42 72 42 Q 90 50 86 75 Q 82 96 60 90 Z" strokeWidth="0.7" strokeDasharray="1.5 2" />
        <path d="M 60 80 Q 48 75 50 65 Q 52 55 68 55 Q 80 60 78 72 Q 76 84 60 80 Z" strokeWidth="0.6" />
      </g>

      {/* Green ellipse */}
      <ellipse cx="62" cy="72" rx="10" ry="6" fill="var(--cm-forest)" fillOpacity="0.15" stroke="var(--cm-forest)" strokeWidth="1" />
      {/* Cup */}
      <circle cx="62" cy="72" r="1.8" fill="var(--cm-ink)" />
      {/* Flagstick */}
      <line x1="62" y1="72" x2="66" y2="30" stroke="var(--cm-ink)" strokeWidth="1.2" strokeLinecap="round" />
      {/* Flag */}
      <path d="M 66 31 L 48 35 L 66 40 Z" fill="var(--cm-topo)" stroke="var(--cm-topo)" strokeWidth="0.5" strokeLinejoin="round" />
    </svg>
  );
}

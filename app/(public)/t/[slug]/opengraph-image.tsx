import { ImageResponse } from "next/og";
import { loadFontsourceFont } from "@/lib/og/fonts";
import { loadLeaderboard } from "@/lib/leaderboard";
import {
  formatRelative,
  mergeHolesAndScores,
  relativeToPar,
  thru,
} from "@/lib/scoring/compute";

export const alt = "Live tournament leaderboard";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Leader = {
  name: string;
  hometown: string | null;
  relative: number;
  through: number;
  finished: boolean;
};

export default async function OG({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const snapshot = await loadLeaderboard(slug);

  const [fraunces600, fraunces600Italic, mono, monoBold] = await Promise.all([
    loadFontsourceFont({ slug: "fraunces", weight: 600 }),
    loadFontsourceFont({ slug: "fraunces", weight: 600, style: "italic" }),
    loadFontsourceFont({ slug: "jetbrains-mono", weight: 500 }),
    loadFontsourceFont({ slug: "jetbrains-mono", weight: 700 }),
  ]);

  const leaders = buildLeaders(snapshot);
  const leader = leaders[0];
  const isLive = snapshot.tournament.status === "live";
  const holesPar = snapshot.holes.reduce((a, h) => a + h.par, 0);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "#F2EEE4",
          color: "#0E120F",
          fontFamily: "Fraunces",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            opacity: 0.08,
          }}
        >
          <svg width="1200" height="630" viewBox="0 0 1200 630">
            {Array.from({ length: 20 }).map((_, i) => {
              const r = 30 + i * 44;
              return (
                <ellipse
                  key={i}
                  cx="140"
                  cy="560"
                  rx={r * 1.8}
                  ry={r * 0.6}
                  fill="none"
                  stroke="#0E120F"
                  strokeWidth={1}
                />
              );
            })}
          </svg>
        </div>

        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "JetBrains Mono",
            fontSize: 20,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16, color: "#4A6B7A" }}>
            <span style={{ color: "#FF6B1A" }}>·</span>
            <span style={{ color: "#0E120F" }}>thru.</span>
            <span>/ leaderboard</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 18px",
              borderRadius: 999,
              background: isLive ? "rgba(30,58,43,0.1)" : "rgba(14,18,15,0.06)",
              color: isLive ? "#1E3A2B" : "rgba(14,18,15,0.6)",
              fontFamily: "JetBrains Mono",
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            {isLive && (
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: "#FF6B1A",
                  display: "block",
                }}
              />
            )}
            <span>{isLive ? "live" : "final"}</span>
          </div>
        </div>

        {/* Tournament name */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              fontSize: 92,
              lineHeight: 0.92,
              letterSpacing: "-0.02em",
              fontWeight: 600,
              display: "flex",
              maxWidth: 1060,
            }}
          >
            {snapshot.tournament.name}
          </div>
          {(snapshot.tournament.course_name || snapshot.tournament.course_location) && (
            <div
              style={{
                display: "flex",
                fontFamily: "JetBrains Mono",
                fontSize: 20,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#4A6B7A",
              }}
            >
              {[snapshot.tournament.course_name, snapshot.tournament.course_location]
                .filter(Boolean)
                .join(" · ")}
            </div>
          )}
        </div>

        {/* Bottom: leader + stats */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 40,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div
              style={{
                display: "flex",
                fontFamily: "JetBrains Mono",
                fontSize: 16,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#4A6B7A",
              }}
            >
              {leader ? "leader" : "field"}
            </div>
            {leader ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div
                  style={{
                    fontSize: 56,
                    lineHeight: 0.95,
                    letterSpacing: "-0.01em",
                    fontWeight: 600,
                    display: "flex",
                  }}
                >
                  {leader.name}
                </div>
                {leader.hometown && (
                  <div
                    style={{
                      display: "flex",
                      fontFamily: "JetBrains Mono",
                      fontSize: 18,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: "#4A6B7A",
                    }}
                  >
                    {leader.hometown}
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  fontSize: 44,
                  fontWeight: 600,
                  display: "flex",
                  color: "rgba(14,18,15,0.4)",
                }}
              >
                {snapshot.participants.length} players ready
              </div>
            )}
          </div>

          {leader ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 6,
              }}
            >
              <div
                style={{
                  fontSize: 140,
                  lineHeight: 0.85,
                  fontWeight: 600,
                  letterSpacing: "-0.04em",
                  display: "flex",
                  color: leader.relative < 0 ? "#FF6B1A" : "#0E120F",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {formatRelative(leader.relative)}
              </div>
              <div
                style={{
                  display: "flex",
                  fontFamily: "JetBrains Mono",
                  fontSize: 18,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#4A6B7A",
                }}
              >
                {leader.finished
                  ? `F · ${snapshot.tournament.hole_count} holes`
                  : `thru ${leader.through} · ${snapshot.tournament.hole_count} holes`}
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                fontFamily: "JetBrains Mono",
                fontSize: 18,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#4A6B7A",
              }}
            >
              <span>
                {snapshot.tournament.hole_count} holes · par {holesPar}
              </span>
            </div>
          )}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Fraunces", data: fraunces600, style: "normal", weight: 600 },
        { name: "Fraunces", data: fraunces600Italic, style: "italic", weight: 600 },
        { name: "JetBrains Mono", data: mono, style: "normal", weight: 500 },
        { name: "JetBrains Mono", data: monoBold, style: "normal", weight: 700 },
      ],
    }
  );
}

function buildLeaders(
  snapshot: Awaited<ReturnType<typeof loadLeaderboard>>
): Leader[] {
  const byParticipant = new Map<string, { hole_id: string; strokes: number }[]>();
  for (const s of snapshot.scores) {
    const bucket = byParticipant.get(s.participant_id) ?? [];
    bucket.push({ hole_id: s.hole_id, strokes: s.strokes });
    byParticipant.set(s.participant_id, bucket);
  }

  const rows = snapshot.participants.map((p) => {
    const merged = mergeHolesAndScores(snapshot.holes, byParticipant.get(p.id) ?? []);
    const through = thru(merged);
    return {
      name: p.display_name,
      hometown: p.hometown,
      relative: relativeToPar(merged),
      through,
      finished: through === snapshot.tournament.hole_count,
    };
  });

  rows.sort((a, b) => {
    if (a.through === 0 && b.through === 0) return 0;
    if (a.through === 0) return 1;
    if (b.through === 0) return -1;
    if (a.relative !== b.relative) return a.relative - b.relative;
    return b.through - a.through;
  });

  return rows.filter((r) => r.through > 0);
}

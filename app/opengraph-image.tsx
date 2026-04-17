import { ImageResponse } from "next/og";
import { loadFontsourceFont } from "@/lib/og/fonts";

export const alt = "thru. — Live golf scoring for every tournament";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  const [fraunces600, fraunces600Italic, mono] = await Promise.all([
    loadFontsourceFont({ slug: "fraunces", weight: 600 }),
    loadFontsourceFont({ slug: "fraunces", weight: 600, style: "italic" }),
    loadFontsourceFont({ slug: "jetbrains-mono", weight: 500 }),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#1E3A2B",
          color: "#EFEBDD",
          fontFamily: "Fraunces",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            opacity: 0.2,
          }}
        >
          <svg width="1200" height="630" viewBox="0 0 1200 630">
            {Array.from({ length: 18 }).map((_, i) => {
              const r = 40 + i * 52;
              return (
                <ellipse
                  key={i}
                  cx="980"
                  cy="540"
                  rx={r * 1.9}
                  ry={r * 0.7}
                  fill="none"
                  stroke="#EFEBDD"
                  strokeWidth={1}
                />
              );
            })}
          </svg>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontFamily: "JetBrains Mono",
            fontSize: 22,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(239,235,221,0.7)",
          }}
        >
          <span style={{ color: "#FF6B1A" }}>·</span>
          <span>thru.</span>
          <span style={{ opacity: 0.5 }}>/ live golf scoring</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 108,
              lineHeight: 0.95,
              letterSpacing: "-0.02em",
              fontWeight: 600,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Keep the card.</span>
            <span
              style={{
                fontStyle: "italic",
                color: "#FF6B1A",
              }}
            >
              Lose the paper.
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontFamily: "JetBrains Mono",
            fontSize: 20,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(239,235,221,0.6)",
          }}
        >
          <span>no paper · no apps · free beta</span>
          <span style={{ color: "#EFEBDD" }}>start a tournament →</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Fraunces", data: fraunces600, style: "normal", weight: 600 },
        { name: "Fraunces", data: fraunces600Italic, style: "italic", weight: 600 },
        { name: "JetBrains Mono", data: mono, style: "normal", weight: 500 },
      ],
    }
  );
}

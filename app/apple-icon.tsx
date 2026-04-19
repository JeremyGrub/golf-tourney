import { ImageResponse } from "next/og";

/**
 * iOS home-screen / PWA install icon. iOS masks whatever we send with a
 * rounded square so we keep the background full-bleed forest green and
 * let the system round the corners. The flag mark is scaled up from the
 * 32px favicon — same silhouette, just with room to breathe.
 *
 * This is a Route Module, auto-wired by Next.js — no metadata config
 * needed in layout.tsx.
 */

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#1E3A2B",
          position: "relative",
        }}
      >
        {/* Flagstick — tall cream rectangle, slightly rounded caps */}
        <div
          style={{
            position: "absolute",
            left: 66,
            top: 36,
            width: 7,
            height: 116,
            background: "#FFFDF7",
            borderRadius: 4,
          }}
        />

        {/* Pennant — right-pointing triangle via clip-path polygon */}
        <div
          style={{
            position: "absolute",
            left: 73,
            top: 38,
            width: 72,
            height: 32,
            background: "#FF6B1A",
            clipPath: "polygon(0 0, 100% 50%, 0 100%)",
          }}
        />

        {/* Cup / green — a faint cream dot where the stick meets the hole */}
        <div
          style={{
            position: "absolute",
            left: 58,
            top: 150,
            width: 22,
            height: 8,
            background: "#FFFDF7",
            opacity: 0.45,
            borderRadius: 5,
          }}
        />
      </div>
    ),
    { ...size }
  );
}

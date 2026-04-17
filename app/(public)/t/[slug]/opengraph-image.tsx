import { ImageResponse } from "next/og";

export const alt = "Leaderboard";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1E3A2B",
          color: "#EFEBDD",
          fontSize: 80,
        }}
      >
        {slug}
      </div>
    ),
    { ...size }
  );
}

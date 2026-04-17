import { notFound } from "next/navigation";
import HoleEntry from "@/components/player/HoleEntry";
import { loadPlayerCard } from "@/lib/player";
import { mergeHolesAndScores } from "@/lib/scoring/compute";

export default async function HoleEntryPage({
  params,
}: {
  params: Promise<{ token: string; n: string }>;
}) {
  const { token, n } = await params;
  const holeNumber = Number.parseInt(n, 10);
  if (!Number.isInteger(holeNumber)) notFound();

  const card = await loadPlayerCard(token);
  const rows = mergeHolesAndScores(card.holes, card.scores);
  const row = rows.find((r) => r.hole_number === holeNumber);
  if (!row) notFound();

  const prev = holeNumber > 1 ? holeNumber - 1 : null;
  const next =
    holeNumber < card.tournament.hole_count ? holeNumber + 1 : null;

  return (
    <HoleEntry
      token={token}
      holeNumber={holeNumber}
      totalHoles={card.tournament.hole_count}
      par={row.par}
      initialStrokes={row.strokes}
      prevHref={prev ? `/play/${token}/hole/${prev}` : null}
      nextHref={next ? `/play/${token}/hole/${next}` : null}
      scorecardHref={`/play/${token}`}
    />
  );
}

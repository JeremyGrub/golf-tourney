export type Hole = { id: string; hole_number: number; par: number };
export type Score = { hole_id: string; strokes: number };

export type HoleWithScore = Hole & { strokes: number | null };

export function mergeHolesAndScores(holes: Hole[], scores: Score[]): HoleWithScore[] {
  const byHole = new Map(scores.map((s) => [s.hole_id, s.strokes]));
  return [...holes]
    .sort((a, b) => a.hole_number - b.hole_number)
    .map((h) => ({ ...h, strokes: byHole.get(h.id) ?? null }));
}

export function totalStrokes(rows: HoleWithScore[]): number {
  return rows.reduce((sum, r) => sum + (r.strokes ?? 0), 0);
}

export function thru(rows: HoleWithScore[]): number {
  return rows.filter((r) => r.strokes !== null).length;
}

export function relativeToPar(rows: HoleWithScore[]): number {
  return rows
    .filter((r) => r.strokes !== null)
    .reduce((sum, r) => sum + (r.strokes! - r.par), 0);
}

export function formatRelative(rel: number): string {
  if (rel === 0) return "E";
  return rel > 0 ? `+${rel}` : `${rel}`;
}

export type ScoreClass =
  | "eagle"
  | "birdie"
  | "par"
  | "bogey"
  | "double"
  | "blank";

export function classifyStroke(strokes: number | null, par: number): ScoreClass {
  if (strokes == null) return "blank";
  const diff = strokes - par;
  if (diff <= -2) return "eagle";
  if (diff === -1) return "birdie";
  if (diff === 0) return "par";
  if (diff === 1) return "bogey";
  return "double";
}

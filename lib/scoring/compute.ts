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

/**
 * Golf score buckets relative to par. Ordered best → worst. We distinguish
 * each recognised name through triple because the pill/cell colours differ;
 * anything +4 or worse collapses into `big` and the UI prints `+N` instead
 * of trying to name it (quadruple bogey, quintuple, …).
 */
export type ScoreClass =
  | "albatross"  // -3 or better (double eagle; condor at -4 is a one-in-a-lifetime thing, still reads as albatross here)
  | "eagle"      // -2
  | "birdie"     // -1
  | "par"        //  0
  | "bogey"      // +1
  | "double"     // +2
  | "triple"     // +3
  | "big"        // +4 or worse
  | "blank";

export function classifyStroke(strokes: number | null, par: number): ScoreClass {
  if (strokes == null) return "blank";
  const diff = strokes - par;
  if (diff <= -3) return "albatross";
  if (diff === -2) return "eagle";
  if (diff === -1) return "birdie";
  if (diff === 0) return "par";
  if (diff === 1) return "bogey";
  if (diff === 2) return "double";
  if (diff === 3) return "triple";
  return "big";
}

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { assertLoaded } from "@/lib/supabase/assert";
import type { Hole, Score } from "@/lib/scoring/compute";

export type PlayerCard = {
  participant: {
    id: string;
    display_name: string;
    hometown: string | null;
  };
  tournament: {
    id: string;
    name: string;
    slug: string;
    course_name: string | null;
    hole_count: 9 | 18;
    status: "draft" | "live" | "complete";
  };
  holes: Hole[];
  scores: Score[];
};

// Matches tokens shaped like UUIDs. Keeps us from round-tripping to Postgres
// on obvious garbage (e.g. `/play/foo`).
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function loadPlayerCard(token: string): Promise<PlayerCard> {
  if (!UUID_RE.test(token)) notFound();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_player_card", {
    p_token: token,
  });

  // get_player_card() returns null for an unknown token rather than raising,
  // so a set `error` always means the backend failed — never "bad link".
  // Folding the two together told a player mid-round that their perfectly
  // good card link was dead.
  assertLoaded(error, "your scorecard");
  if (!data) notFound();
  return data as unknown as PlayerCard;
}

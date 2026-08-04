import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { assertLoaded } from "@/lib/supabase/assert";
import type { Hole, Score } from "@/lib/scoring/compute";

export type LeaderboardParticipant = {
  id: string;
  display_name: string;
  hometown: string | null;
};

export type LeaderboardScore = Score & { participant_id: string };

export type LeaderboardSnapshot = {
  tournament: {
    id: string;
    name: string;
    slug: string;
    course_name: string | null;
    course_location: string | null;
    hole_count: 9 | 18;
    status: "live" | "complete";
    start_date: string | null;
    start_time: string | null;
  };
  holes: Hole[];
  participants: LeaderboardParticipant[];
  scores: LeaderboardScore[];
};

// Every query here is asserted: a failed tournament lookup would otherwise
// render the not-found page ("the URL might be off by a character") to every
// spectator mid-round, and a failed `holes` fetch would quietly publish a
// board with par 0 and every to-par figure wrong.
export async function loadLeaderboard(slug: string): Promise<LeaderboardSnapshot> {
  const supabase = await createClient();

  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select(
      "id, name, slug, course_name, course_location, hole_count, status, start_date, start_time"
    )
    .eq("slug", slug)
    .in("status", ["live", "complete"])
    .maybeSingle();

  // Order matters — a failed query has to throw before a null `tournament`
  // can be mistaken for "no such tournament".
  assertLoaded(tournamentError, "the tournament");
  if (!tournament) notFound();

  const [holesResult, participantsResult] = await Promise.all([
    supabase
      .from("holes")
      .select("id, hole_number, par")
      .eq("tournament_id", tournament.id)
      .order("hole_number", { ascending: true }),
    supabase
      .from("public_participants")
      .select("id, display_name, hometown")
      .eq("tournament_id", tournament.id)
      .order("created_at", { ascending: true }),
  ]);

  assertLoaded(holesResult.error, "the scorecard");
  assertLoaded(participantsResult.error, "the field");

  const participants = participantsResult.data ?? [];
  const participantIds = participants.map((p) => p.id);

  const scoresResult =
    participantIds.length > 0
      ? await supabase
          .from("scores")
          .select("hole_id, strokes, participant_id")
          .in("participant_id", participantIds)
      : { data: [], error: null };

  assertLoaded(scoresResult.error, "the scores");

  return {
    tournament: tournament as LeaderboardSnapshot["tournament"],
    holes: (holesResult.data ?? []) as Hole[],
    participants: participants as LeaderboardParticipant[],
    scores: (scoresResult.data ?? []) as LeaderboardScore[],
  };
}

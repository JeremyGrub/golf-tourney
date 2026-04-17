import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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

export async function loadLeaderboard(slug: string): Promise<LeaderboardSnapshot> {
  const supabase = await createClient();

  const { data: tournament } = await supabase
    .from("tournaments")
    .select(
      "id, name, slug, course_name, course_location, hole_count, status, start_date, start_time"
    )
    .eq("slug", slug)
    .in("status", ["live", "complete"])
    .maybeSingle();

  if (!tournament) notFound();

  const [{ data: holes }, { data: participants }] = await Promise.all([
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

  const participantIds = (participants ?? []).map((p) => p.id);
  const { data: scores } =
    participantIds.length > 0
      ? await supabase
          .from("scores")
          .select("hole_id, strokes, participant_id")
          .in("participant_id", participantIds)
      : { data: [] };

  return {
    tournament: tournament as LeaderboardSnapshot["tournament"],
    holes: (holes ?? []) as Hole[],
    participants: (participants ?? []) as LeaderboardParticipant[],
    scores: (scores ?? []) as LeaderboardScore[],
  };
}

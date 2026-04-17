"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { LeaderboardScore } from "@/lib/leaderboard";

type ScoreRow = {
  participant_id: string;
  hole_id: string;
  strokes: number;
};

export function useLeaderboardRealtime(
  participantIds: Set<string>,
  onScore: (row: LeaderboardScore) => void
) {
  useEffect(() => {
    if (participantIds.size === 0) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`leaderboard:${Array.from(participantIds).sort().join(",").slice(0, 60)}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "scores" },
        (payload) => {
          const row = payload.new as ScoreRow;
          if (!participantIds.has(row.participant_id)) return;
          onScore({
            participant_id: row.participant_id,
            hole_id: row.hole_id,
            strokes: row.strokes,
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "scores" },
        (payload) => {
          const row = payload.new as ScoreRow;
          if (!participantIds.has(row.participant_id)) return;
          onScore({
            participant_id: row.participant_id,
            hole_id: row.hole_id,
            strokes: row.strokes,
          });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [participantIds, onScore]);
}

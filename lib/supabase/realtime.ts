"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { LeaderboardScore } from "@/lib/leaderboard";

type ScoreRow = {
  participant_id: string;
  hole_id: string;
  strokes: number;
};

/**
 * Subscribe to INSERTs + UPDATEs on `public.scores` and pipe rows that belong
 * to the current field into `onScore`. submit_score upserts, so UPDATEs are
 * the common path for a player tapping +/- after the first save on a hole.
 *
 * Realtime prerequisites (easy to forget, hard to notice is missing):
 *   1. The `scores` table must be in the `supabase_realtime` publication.
 *      Migration 0001 does this, but if you've ever dropped/recreated the
 *      table or applied migrations out of order it can silently fall out.
 *      Verify in the Supabase SQL editor with:
 *        select schemaname, tablename from pg_publication_tables
 *         where pubname = 'supabase_realtime';
 *      If `public.scores` isn't there, run:
 *        alter publication supabase_realtime add table public.scores;
 *
 *   2. RLS on `scores` must allow the anon role to SELECT the row. The
 *      `scores_public_read` policy in migration 0001 covers this for any
 *      tournament in status `live` or `complete`.
 *
 * The channel logs its subscription status to the console in dev so you
 * can confirm `SUBSCRIBED` from the browser devtools. In prod we stay
 * quiet unless something goes sideways (CHANNEL_ERROR / TIMED_OUT) —
 * those we surface so they're findable in the field.
 */
export function useLeaderboardRealtime(
  participantIds: Set<string>,
  onScore: (row: LeaderboardScore) => void
) {
  useEffect(() => {
    if (participantIds.size === 0) return;
    const supabase = createClient();
    const ids = Array.from(participantIds);
    const channelKey = `leaderboard:${ids.sort().join(",").slice(0, 60)}`;

    const handle = (payload: { new: unknown }) => {
      const row = payload.new as ScoreRow;
      if (!row || !participantIds.has(row.participant_id)) return;
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.debug("[leaderboard] score event", row);
      }
      onScore({
        participant_id: row.participant_id,
        hole_id: row.hole_id,
        strokes: row.strokes,
      });
    };

    const channel = supabase
      .channel(channelKey)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "scores" },
        handle
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "scores" },
        handle
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          if (process.env.NODE_ENV !== "production") {
            // eslint-disable-next-line no-console
            console.debug("[leaderboard] realtime subscribed", channelKey);
          }
          return;
        }
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          // Surface in prod too — this is the thing that bites you when
          // the publication is misconfigured or the WS gets blocked.
          // eslint-disable-next-line no-console
          console.warn("[leaderboard] realtime status", status, err ?? "");
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [participantIds, onScore]);
}

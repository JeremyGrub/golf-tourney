-- ============================================================
-- Player-facing RPCs
-- Anon cannot read participants directly (RLS), so expose a
-- SECURITY DEFINER function that returns everything the player's
-- scorecard needs in one shot, keyed by their access_token.
-- ============================================================

create or replace function public.get_player_card(p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_participant public.participants;
  v_tournament  public.tournaments;
  v_holes       jsonb;
  v_scores      jsonb;
begin
  select * into v_participant
    from public.participants
   where access_token = p_token;
  if v_participant.id is null then
    return null;
  end if;

  select * into v_tournament
    from public.tournaments
   where id = v_participant.tournament_id;

  select coalesce(
           jsonb_agg(
             jsonb_build_object(
               'id', h.id,
               'hole_number', h.hole_number,
               'par', h.par
             ) order by h.hole_number
           ),
           '[]'::jsonb
         )
    into v_holes
    from public.holes h
   where h.tournament_id = v_tournament.id;

  select coalesce(
           jsonb_agg(
             jsonb_build_object(
               'hole_id', s.hole_id,
               'strokes', s.strokes
             )
           ),
           '[]'::jsonb
         )
    into v_scores
    from public.scores s
   where s.participant_id = v_participant.id;

  return jsonb_build_object(
    'participant', jsonb_build_object(
      'id',           v_participant.id,
      'display_name', v_participant.display_name,
      'hometown',     v_participant.hometown
    ),
    'tournament', jsonb_build_object(
      'id',          v_tournament.id,
      'name',        v_tournament.name,
      'slug',        v_tournament.slug,
      'course_name', v_tournament.course_name,
      'hole_count',  v_tournament.hole_count,
      'status',      v_tournament.status
    ),
    'holes',  v_holes,
    'scores', v_scores
  );
end;
$$;

revoke all on function public.get_player_card(uuid) from public;
grant  execute on function public.get_player_card(uuid) to anon, authenticated;

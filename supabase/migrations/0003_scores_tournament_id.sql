-- ============================================================
-- 0003_scores_tournament_id
--
-- Why this exists
-- ---------------
-- The public leaderboard subscribes to `postgres_changes` on public.scores
-- via Supabase Realtime. The original `scores_public_read` policy was a
-- multi-table EXISTS (participants ⋈ tournaments). SELECT queries evaluate
-- that fine, but Realtime's per-event RLS evaluator is historically
-- unreliable with subqueries that cross more than one table — events fire
-- at the WAL level, the client channel reports SUBSCRIBED, and yet the
-- row never reaches the browser because the evaluator silently drops it.
--
-- The fix is denormalisation: put `tournament_id` directly on scores so
-- the policy collapses to a single-table lookup, which the evaluator
-- handles reliably.
--
-- submit_score is the only way rows land in scores (RLS blocks direct
-- writes), so we also teach it to populate the new column on insert.
-- ============================================================

-- ---- 1. Add the column (nullable first for backfill safety) -------------
alter table public.scores
  add column if not exists tournament_id uuid
  references public.tournaments(id) on delete cascade;

-- ---- 2. Backfill existing rows via the participant ----------------------
update public.scores s
   set tournament_id = p.tournament_id
  from public.participants p
 where s.tournament_id is null
   and p.id = s.participant_id;

-- ---- 3. Tighten + index -------------------------------------------------
alter table public.scores
  alter column tournament_id set not null;

create index if not exists scores_tournament_idx
  on public.scores (tournament_id);

-- ---- 4. Replace the policies with single-table lookups ------------------
-- Public read: anyone can see scores for a live/complete tournament.
drop policy if exists "scores_public_read" on public.scores;
create policy "scores_public_read" on public.scores
  for select
  using (exists (
    select 1
      from public.tournaments t
     where t.id = scores.tournament_id
       and t.status in ('live', 'complete')
  ));

-- Host read: host sees every score on their own tournament, regardless
-- of status (so draft previews still show scores).
drop policy if exists "scores_host_read" on public.scores;
create policy "scores_host_read" on public.scores
  for select
  using (exists (
    select 1
      from public.tournaments t
     where t.id = scores.tournament_id
       and t.host_id = auth.uid()
  ));

-- ---- 5. Update submit_score so future rows get the new column filled ---
create or replace function public.submit_score(
  p_token       uuid,
  p_hole_number smallint,
  p_strokes     smallint
)
returns public.scores
language plpgsql
security definer
set search_path = public
as $$
declare
  v_participant public.participants;
  v_tournament  public.tournaments;
  v_hole        public.holes;
  v_score       public.scores;
begin
  select * into v_participant
    from public.participants
   where access_token = p_token;
  if v_participant.id is null then
    raise exception 'invalid_token' using errcode = 'P0001';
  end if;

  select * into v_tournament
    from public.tournaments
   where id = v_participant.tournament_id;
  if v_tournament.status <> 'live' then
    raise exception 'tournament_not_live' using errcode = 'P0002';
  end if;

  select * into v_hole
    from public.holes
   where tournament_id = v_tournament.id
     and hole_number   = p_hole_number;
  if v_hole.id is null then
    raise exception 'invalid_hole' using errcode = 'P0003';
  end if;

  if p_strokes < 1 or p_strokes > 20 then
    raise exception 'invalid_strokes' using errcode = 'P0004';
  end if;

  insert into public.scores (participant_id, hole_id, strokes, tournament_id)
  values (v_participant.id, v_hole.id, p_strokes, v_tournament.id)
  on conflict (participant_id, hole_id)
    do update set strokes = excluded.strokes, submitted_at = now()
  returning * into v_score;

  return v_score;
end;
$$;

revoke all on function public.submit_score(uuid, smallint, smallint) from public;
grant  execute on function public.submit_score(uuid, smallint, smallint) to anon, authenticated;

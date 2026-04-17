-- ============================================================
-- Golf Tourney — initial schema
-- Single-round stroke play, 9 or 18 holes, tokenized player access
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- Enums
-- ============================================================
create type public.tournament_status as enum ('draft', 'live', 'complete');
create type public.scoring_format as enum ('stroke_play');

-- ============================================================
-- Tables
-- ============================================================

-- Hosts only. Mirrors auth.users for app-level name/email.
create table public.users (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  name       text,
  created_at timestamptz not null default now()
);

create table public.tournaments (
  id              uuid primary key default gen_random_uuid(),
  host_id         uuid not null references public.users(id) on delete cascade,
  name            text not null,
  slug            text not null unique,
  course_name     text,
  course_location text,
  start_date      date,
  start_time      time,
  hole_count      smallint not null check (hole_count in (9, 18)),
  status          public.tournament_status not null default 'draft',
  format          public.scoring_format not null default 'stroke_play',
  created_at      timestamptz not null default now()
);
create index tournaments_host_idx   on public.tournaments (host_id);
create index tournaments_status_idx on public.tournaments (status);

create table public.holes (
  id              uuid primary key default gen_random_uuid(),
  tournament_id   uuid not null references public.tournaments(id) on delete cascade,
  hole_number     smallint not null check (hole_number between 1 and 18),
  par             smallint not null default 4 check (par between 3 and 6),
  yardage         integer,
  handicap_index  smallint,
  unique (tournament_id, hole_number)
);

create table public.tee_times (
  id              uuid primary key default gen_random_uuid(),
  tournament_id   uuid not null references public.tournaments(id) on delete cascade,
  tee_time        time not null,
  starting_hole   smallint not null default 1 check (starting_hole in (1, 10)),
  group_label     text
);

create table public.participants (
  id              uuid primary key default gen_random_uuid(),
  tournament_id   uuid not null references public.tournaments(id) on delete cascade,
  display_name    text not null,
  hometown        text,
  tee_time_id     uuid references public.tee_times(id) on delete set null,
  access_token    uuid not null unique default gen_random_uuid(),
  created_at      timestamptz not null default now()
);
create index participants_tournament_idx on public.participants (tournament_id);

create table public.scores (
  id              uuid primary key default gen_random_uuid(),
  participant_id  uuid not null references public.participants(id) on delete cascade,
  hole_id         uuid not null references public.holes(id) on delete cascade,
  strokes         smallint not null check (strokes between 1 and 20),
  submitted_at    timestamptz not null default now(),
  unique (participant_id, hole_id)
);
create index scores_participant_idx on public.scores (participant_id);
create index scores_hole_idx        on public.scores (hole_id);

-- ============================================================
-- Auto-provision public.users row when a new auth user signs up
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ============================================================
-- submit_score RPC — the only way clients write to `scores`
-- Verifies token server-side, upserts the score for that hole.
-- ============================================================
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

  insert into public.scores (participant_id, hole_id, strokes)
  values (v_participant.id, v_hole.id, p_strokes)
  on conflict (participant_id, hole_id)
    do update set strokes = excluded.strokes, submitted_at = now()
  returning * into v_score;

  return v_score;
end;
$$;

revoke all on function public.submit_score(uuid, smallint, smallint) from public;
grant  execute on function public.submit_score(uuid, smallint, smallint) to anon, authenticated;

-- ============================================================
-- public_participants view — omits access_token from public reads
-- (RLS on the base table blocks anon entirely; this view is the
-- only anon-readable projection.)
-- ============================================================
create or replace view public.public_participants
with (security_invoker = off) as
select p.id,
       p.tournament_id,
       p.display_name,
       p.hometown,
       p.tee_time_id,
       p.created_at
  from public.participants p
  join public.tournaments  t on t.id = p.tournament_id
 where t.status in ('live', 'complete');

grant select on public.public_participants to anon, authenticated;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.users        enable row level security;
alter table public.tournaments  enable row level security;
alter table public.holes        enable row level security;
alter table public.tee_times    enable row level security;
alter table public.participants enable row level security;
alter table public.scores       enable row level security;

-- users: only your own row
create policy "users_self_select" on public.users
  for select using (id = auth.uid());
create policy "users_self_update" on public.users
  for update using (id = auth.uid()) with check (id = auth.uid());

-- tournaments: hosts manage their own; public reads live/complete
create policy "tournaments_host_all" on public.tournaments
  for all  using (host_id = auth.uid())
  with check (host_id = auth.uid());
create policy "tournaments_public_read" on public.tournaments
  for select using (status in ('live', 'complete'));

-- holes
create policy "holes_host_all" on public.holes
  for all using (exists (
    select 1 from public.tournaments t
     where t.id = holes.tournament_id and t.host_id = auth.uid()
  )) with check (exists (
    select 1 from public.tournaments t
     where t.id = holes.tournament_id and t.host_id = auth.uid()
  ));
create policy "holes_public_read" on public.holes
  for select using (exists (
    select 1 from public.tournaments t
     where t.id = holes.tournament_id and t.status in ('live', 'complete')
  ));

-- tee_times
create policy "tee_times_host_all" on public.tee_times
  for all using (exists (
    select 1 from public.tournaments t
     where t.id = tee_times.tournament_id and t.host_id = auth.uid()
  )) with check (exists (
    select 1 from public.tournaments t
     where t.id = tee_times.tournament_id and t.host_id = auth.uid()
  ));
create policy "tee_times_public_read" on public.tee_times
  for select using (exists (
    select 1 from public.tournaments t
     where t.id = tee_times.tournament_id and t.status in ('live', 'complete')
  ));

-- participants: host CRUD only. Anon sees safe subset via public_participants view.
create policy "participants_host_all" on public.participants
  for all using (exists (
    select 1 from public.tournaments t
     where t.id = participants.tournament_id and t.host_id = auth.uid()
  )) with check (exists (
    select 1 from public.tournaments t
     where t.id = participants.tournament_id and t.host_id = auth.uid()
  ));

-- scores: read-only via RLS. Writes ONLY via submit_score (SECURITY DEFINER).
create policy "scores_public_read" on public.scores
  for select using (exists (
    select 1 from public.participants p
      join public.tournaments  t on t.id = p.tournament_id
     where p.id = scores.participant_id
       and t.status in ('live', 'complete')
  ));
create policy "scores_host_read" on public.scores
  for select using (exists (
    select 1 from public.participants p
      join public.tournaments  t on t.id = p.tournament_id
     where p.id = scores.participant_id
       and t.host_id = auth.uid()
  ));

-- ============================================================
-- Realtime — enable pub/sub on tables the leaderboard watches
-- ============================================================
alter publication supabase_realtime add table public.scores;
alter publication supabase_realtime add table public.tournaments;

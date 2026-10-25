-- Khaffif — Supabase database schema
-- Run this whole file in Supabase → SQL Editor

-- Devices currently inside a zone (one row per device, no identity stored)
create table if not exists presence (
  session_id text primary key,
  uni        text not null,
  place      text not null,
  last_seen  timestamptz not null default now()
);

-- Crowd reports ("How crowded is it?")
create table if not exists reports (
  id         bigint generated always as identity primary key,
  session_id text,
  uni        text not null,
  place      text not null,
  level      text not null check (level in ('low','mid','high')),
  created_at timestamptz not null default now()
);

-- Zone boundaries shared by all clients
create table if not exists places (
  uni    text not null,
  id     text not null,
  name   text,
  lat    double precision not null,
  lng    double precision not null,
  radius int not null,
  primary key (uni, id)
);

-- Live device count per zone
-- People: counted if they sent a heartbeat in the last 3 minutes
-- Cars (session_id ends with -car): counted until they leave, max 12 hours
create or replace view place_counts with (security_invoker = on) as
select uni, place, count(*)::int as devices
from presence
where (session_id like '%-car' and last_seen > now() - interval '12 hours')
   or last_seen > now() - interval '3 minutes'
group by uni, place;

-- Crowd report summary for the last 15 minutes
create or replace view place_reports with (security_invoker = on) as
select uni, place,
  count(*) filter (where level = 'low')::int  as low,
  count(*) filter (where level = 'mid')::int  as mid,
  count(*) filter (where level = 'high')::int as high
from reports
where created_at > now() - interval '15 minutes'
group by uni, place;

-- Row-level security: open for the prototype; production would scope it to university SSO users
alter table presence enable row level security;
alter table reports  enable row level security;
alter table places   enable row level security;

drop policy if exists "presence_all" on presence;
create policy "presence_all" on presence for all to anon using (true) with check (true);

drop policy if exists "reports_read" on reports;
create policy "reports_read" on reports for select to anon using (true);
drop policy if exists "reports_insert" on reports;
create policy "reports_insert" on reports for insert to anon with check (true);

drop policy if exists "places_all" on places;
create policy "places_all" on places for all to anon using (true) with check (true);

grant select on place_counts, place_reports to anon;

-- Unmet demand: a student searched for a study space and found none
create table if not exists unmet (
  id         bigint generated always as identity primary key,
  uni        text not null,
  mode       text not null,
  hour       int  not null,
  created_at timestamptz not null default now()
);
alter table unmet enable row level security;
drop policy if exists "unmet_insert" on unmet;
create policy "unmet_insert" on unmet for insert to anon with check (true);
drop policy if exists "unmet_read" on unmet;
create policy "unmet_read" on unmet for select to anon using (true);

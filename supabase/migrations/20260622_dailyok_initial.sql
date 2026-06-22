create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  account_key text primary key,
  display_name text,
  challenge text check (challenge in ('야식', '단음식', '배달음식', '불규칙한 식사', '술 마시기', '움직이지 않기')),
  pace text check (pace in ('가볍게', '꾸준하게', '집중해서')),
  coach_tone text check (coach_tone in ('다정하게', '솔직하게', '발랄하게')),
  current_weight_kg numeric(5,2),
  goal_weight_kg numeric(5,2),
  target_date date,
  custom_daily_target_calories integer check (custom_daily_target_calories between 1200 and 2600),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.food_logs (
  id uuid primary key default gen_random_uuid(),
  account_key text not null,
  logged_on date not null,
  meal_section text check (meal_section in ('아침', '점심', '저녁', '간식')),
  name text not null,
  calories integer not null check (calories >= 0),
  portion_multiplier numeric(5,2) not null default 1 check (portion_multiplier > 0),
  consumed_grams integer,
  source text check (source in ('manual', 'search')),
  note text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.exercise_logs (
  id uuid primary key default gen_random_uuid(),
  account_key text not null,
  logged_on date not null,
  name text not null,
  minutes integer not null check (minutes > 0),
  burned_calories integer not null check (burned_calories >= 0),
  met numeric(4,2),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.habit_templates (
  id uuid primary key default gen_random_uuid(),
  account_key text not null,
  type text not null check (type in ('do', 'avoid')),
  title text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (account_key, type, title)
);

create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  account_key text not null,
  habit_template_id uuid not null references public.habit_templates(id) on delete cascade,
  logged_on date not null,
  status text not null check (status in ('done', 'pending', 'failed')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (account_key, habit_template_id, logged_on)
);

create table if not exists public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  account_key text not null,
  logged_on date not null,
  weight_kg numeric(5,2) not null check (weight_kg > 0),
  created_at timestamptz not null default timezone('utc', now()),
  unique (account_key, logged_on)
);

create table if not exists public.widget_snapshots (
  account_key text primary key,
  snapshot_date date not null,
  net_calories integer not null default 0,
  target_calories integer not null default 0,
  do_done_count integer not null default 0,
  do_total_count integer not null default 0,
  avoid_success_count integer not null default 0,
  avoid_total_count integer not null default 0,
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists food_logs_user_date_idx on public.food_logs (account_key, logged_on desc);
create index if not exists exercise_logs_user_date_idx on public.exercise_logs (account_key, logged_on desc);
create index if not exists habit_logs_user_date_idx on public.habit_logs (account_key, logged_on desc);
create index if not exists weight_logs_user_date_idx on public.weight_logs (account_key, logged_on desc);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists habit_templates_set_updated_at on public.habit_templates;
create trigger habit_templates_set_updated_at
before update on public.habit_templates
for each row execute function public.set_updated_at();

drop trigger if exists habit_logs_set_updated_at on public.habit_logs;
create trigger habit_logs_set_updated_at
before update on public.habit_logs
for each row execute function public.set_updated_at();

drop trigger if exists widget_snapshots_set_updated_at on public.widget_snapshots;
create trigger widget_snapshots_set_updated_at
before update on public.widget_snapshots
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.food_logs enable row level security;
alter table public.exercise_logs enable row level security;
alter table public.habit_templates enable row level security;
alter table public.habit_logs enable row level security;
alter table public.weight_logs enable row level security;
alter table public.widget_snapshots enable row level security;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using ((select public.current_account_key()) = account_key);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check ((select public.current_account_key()) = account_key);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using ((select public.current_account_key()) = account_key)
with check ((select public.current_account_key()) = account_key);

create policy "food_logs_all_own"
on public.food_logs
for all
to authenticated
using ((select public.current_account_key()) = account_key)
with check ((select public.current_account_key()) = account_key);

create policy "exercise_logs_all_own"
on public.exercise_logs
for all
to authenticated
using ((select public.current_account_key()) = account_key)
with check ((select public.current_account_key()) = account_key);

create policy "habit_templates_all_own"
on public.habit_templates
for all
to authenticated
using ((select public.current_account_key()) = account_key)
with check ((select public.current_account_key()) = account_key);

create policy "habit_logs_all_own"
on public.habit_logs
for all
to authenticated
using ((select public.current_account_key()) = account_key)
with check ((select public.current_account_key()) = account_key);

create policy "weight_logs_all_own"
on public.weight_logs
for all
to authenticated
using ((select public.current_account_key()) = account_key)
with check ((select public.current_account_key()) = account_key);

create policy "widget_snapshots_all_own"
on public.widget_snapshots
for all
to authenticated
using ((select public.current_account_key()) = account_key)
with check ((select public.current_account_key()) = account_key);

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.food_logs to authenticated;
grant select, insert, update, delete on public.exercise_logs to authenticated;
grant select, insert, update, delete on public.habit_templates to authenticated;
grant select, insert, update, delete on public.habit_logs to authenticated;
grant select, insert, update, delete on public.weight_logs to authenticated;
grant select, insert, update, delete on public.widget_snapshots to authenticated;

grant all on public.profiles to service_role;
grant all on public.food_logs to service_role;
grant all on public.exercise_logs to service_role;
grant all on public.habit_templates to service_role;
grant all on public.habit_logs to service_role;
grant all on public.weight_logs to service_role;
grant all on public.widget_snapshots to service_role;
create or replace function public.current_account_key()
returns text
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

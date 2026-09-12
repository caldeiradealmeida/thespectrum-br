-- Aplicado em 2026-09-12 no projeto caldeira-cgi (vppbphjrrrrpokqycwwa) via MCP.
create table if not exists public.spectrum_results (
  id text primary key,
  created_at timestamptz not null default now(),
  instrument_version int not null,
  econ smallint not null check (econ between -100 and 100),
  costumes smallint not null check (costumes between -100 and 100),
  instituicoes smallint not null check (instituicoes between -100 and 100),
  label text not null,
  unlock_token text not null,
  uf text,
  age_range text
);
create table if not exists public.spectrum_responses (
  id bigserial primary key,
  result_id text not null references public.spectrum_results(id) on delete cascade,
  question_id text not null,
  value smallint not null check (value between 1 and 7),
  unique (result_id, question_id)
);
create index if not exists spectrum_responses_result_idx on public.spectrum_responses(result_id);
create table if not exists public.spectrum_unlocks (
  id bigserial primary key,
  result_id text not null references public.spectrum_results(id) on delete cascade,
  email text not null,
  consent_updates boolean not null default false,
  consent_text_version int not null default 1,
  created_at timestamptz not null default now()
);
create index if not exists spectrum_unlocks_email_idx on public.spectrum_unlocks(lower(email));
create index if not exists spectrum_unlocks_result_idx on public.spectrum_unlocks(result_id);
create table if not exists public.spectrum_reports (
  result_id text primary key references public.spectrum_results(id) on delete cascade,
  report_md text not null,
  model text not null,
  created_at timestamptz not null default now()
);
alter table public.spectrum_results   enable row level security;
alter table public.spectrum_responses enable row level security;
alter table public.spectrum_unlocks   enable row level security;
alter table public.spectrum_reports   enable row level security;
create or replace function public.spectrum_percentiles(e int, c int, i int)
returns table (n bigint, econ_pct numeric, costumes_pct numeric, instituicoes_pct numeric)
language sql stable security definer set search_path = public as $$
  select
    count(*) as n,
    case when count(*) = 0 then null else round(100.0 * count(*) filter (where econ < e) / count(*), 0) end,
    case when count(*) = 0 then null else round(100.0 * count(*) filter (where costumes < c) / count(*), 0) end,
    case when count(*) = 0 then null else round(100.0 * count(*) filter (where instituicoes < i) / count(*), 0) end
  from public.spectrum_results;
$$;
revoke all on function public.spectrum_percentiles(int,int,int) from public, anon, authenticated;

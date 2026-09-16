-- Aplicado em 2026-09-16 no projeto caldeira-cgi via MCP.
-- 1) Campos opcionais de perfil (todos declarados pela pessoa, nunca inferidos)
--    e origem de tráfego (UTM — não identifica ninguém).
alter table public.spectrum_results
  add column if not exists education text,
  add column if not exists vote_2022 text,
  add column if not exists self_placement smallint check (self_placement between 1 and 7),
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists device text;

-- 2) Eventos anônimos de funil. Sem IP, sem user-agent completo, sem cookie
--    persistente: `session_id` é um id aleatório que vive só na aba (sessionStorage).
create table if not exists public.spectrum_events (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  event text not null,
  session_id text,
  result_id text,
  path text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  device text,
  meta jsonb
);
create index if not exists spectrum_events_created_idx on public.spectrum_events(created_at);
create index if not exists spectrum_events_event_idx on public.spectrum_events(event);
alter table public.spectrum_events enable row level security;

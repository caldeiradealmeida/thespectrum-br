-- Aplicado em 2026-09-12: médias por eixo na função de percentis.
drop function if exists public.spectrum_percentiles(int,int,int);
create function public.spectrum_percentiles(e int, c int, i int)
returns table (n bigint, econ_pct numeric, costumes_pct numeric, instituicoes_pct numeric, econ_avg numeric, costumes_avg numeric, instituicoes_avg numeric)
language sql stable security definer set search_path = public as $$
  select count(*) as n,
    case when count(*) = 0 then null else round(100.0 * count(*) filter (where econ < e) / count(*), 0) end,
    case when count(*) = 0 then null else round(100.0 * count(*) filter (where costumes < c) / count(*), 0) end,
    case when count(*) = 0 then null else round(100.0 * count(*) filter (where instituicoes < i) / count(*), 0) end,
    round(avg(econ), 0), round(avg(costumes), 0), round(avg(instituicoes), 0)
  from public.spectrum_results;
$$;
revoke all on function public.spectrum_percentiles(int,int,int) from public, anon, authenticated;

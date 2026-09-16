import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { getStore, ResultRow } from "@/lib/db";
import { AXES } from "@/lib/instrument";
import { AGES, EDUCATION, SELF_PLACEMENT_LABELS, VOTE_2022 } from "@/lib/demographics";

export const dynamic = "force-dynamic";
export const metadata = { title: "Painel", robots: { index: false, follow: false } };

const PERIODS = [
  { key: "7", label: "7 dias", days: 7 },
  { key: "30", label: "30 dias", days: 30 },
  { key: "90", label: "90 dias", days: 90 },
  { key: "tudo", label: "Tudo", days: 0 },
];

// ------------------------------------------------------------ helpers

function count<T>(items: T[], key: (t: T) => string | null | undefined): [string, number][] {
  const m = new Map<string, number>();
  for (const it of items) {
    const k = key(it);
    if (k == null || k === "") continue;
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

function mean(xs: number[]): number | null {
  return xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null;
}

function pct(a: number, b: number): string {
  return b ? `${Math.round((100 * a) / b)}%` : "—";
}

function dayKey(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit" });
}

/** Isolado para o linter de pureza: a página é dinâmica, renderizada a cada requisição. */
function currentTime(): number {
  return Date.now();
}

const fmt = (n: number) => `${n > 0 ? "+" : ""}${n}`;

// ------------------------------------------------------------ UI bits

function Kpi({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="card p-5">
      <p className="kicker m-0 mb-1">{label}</p>
      <p className="text-3xl font-black text-navy m-0 tabular-nums">{value}</p>
      {sub && <p className="text-xs text-muted m-0 mt-1">{sub}</p>}
    </div>
  );
}

function Bars({ rows, total, labelOf }: { rows: [string, number][]; total: number; labelOf?: (k: string) => string }) {
  const max = Math.max(1, ...rows.map((r) => r[1]));
  if (!rows.length) return <p className="text-sm text-muted m-0">Sem dados ainda.</p>;
  return (
    <div className="grid gap-2">
      {rows.map(([k, n]) => (
        <div key={k} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 items-center text-sm">
          <div className="min-w-0">
            <div className="flex justify-between gap-2">
              <span className="truncate">{labelOf ? labelOf(k) : k}</span>
              <span className="tabular-nums text-muted shrink-0">
                {n} · {pct(n, total)}
              </span>
            </div>
            <div className="h-2 rounded-full bg-cream-deep overflow-hidden mt-1">
              <div className="h-full bg-navy" style={{ width: `${(100 * n) / max}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Histogram({ values }: { values: number[] }) {
  // 10 faixas de 20 pontos: −100..−81, …, 81..100
  const bins = new Array(10).fill(0) as number[];
  for (const v of values) bins[Math.min(9, Math.max(0, Math.floor((v + 100) / 20)))]++;
  const max = Math.max(1, ...bins);
  return (
    <div className="flex items-end gap-1 h-20">
      {bins.map((b, i) => (
        <div key={i} className="flex-1 h-full flex flex-col justify-end items-center gap-1" title={`${-100 + i * 20} a ${-80 + i * 20}: ${b}`}>
          <div className={`w-full rounded-t ${i < 4 ? "bg-accent" : i > 5 ? "bg-navy" : "bg-navy-soft"}`} style={{ height: `${Math.max(2, (100 * b) / max)}%` }} />
        </div>
      ))}
    </div>
  );
}

function Section({ title, children, note }: { title: string; children: React.ReactNode; note?: string }) {
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="text-base font-bold text-navy m-0 mb-1">{title}</h2>
      {note && <p className="text-xs text-muted m-0 mb-4">{note}</p>}
      {!note && <div className="mb-4" />}
      {children}
    </section>
  );
}

// ------------------------------------------------------------ page

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ dias?: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { dias } = await searchParams;
  const period = PERIODS.find((p) => p.key === dias) ?? PERIODS[1];
  const now = currentTime();
  const since = period.days ? new Date(now - period.days * 86400000) : new Date(0);

  const { results, unlocks, events } = await getStore().adminData(since);
  const n = results.length;
  const unlockedIds = new Set(unlocks.map((u) => u.result_id));
  const withEmail = results.filter((r) => unlockedIds.has(r.id)).length;
  const newsletter = unlocks.filter((u) => u.consent_updates).length;
  const last24 = results.filter((r) => now - new Date(r.created_at).getTime() < 86400000).length;

  // Série diária (últimos 14 dias do período)
  const byDay = count(results, (r) => dayKey(r.created_at));
  const dayOrder = [...new Set(results.map((r) => dayKey(r.created_at)))];
  const series = dayOrder.slice(0, 14).reverse().map((d) => [d, byDay.find((x) => x[0] === d)?.[1] ?? 0] as [string, number]);
  const seriesMax = Math.max(1, ...series.map((s) => s[1]));

  // Funil por sessão (eventos próprios; começam em 16/09/2026)
  const sessions = (ev: string) => new Set(events.filter((e) => e.event === ev && e.session_id).map((e) => e.session_id)).size;
  const funnel: [string, number][] = [
    ["Abriu o site", sessions("page_view")],
    ["Começou o teste", sessions("quiz_start")],
    ["Concluiu", sessions("quiz_complete")],
    ["Deixou e-mail", sessions("unlock")],
    ["Clicou em compartilhar", sessions("share_click")],
  ];
  const clicks: [string, number][] = [
    ["Teaser (Veja por quê)", events.filter((e) => e.event === "teaser_click").length],
    ["CTA fixo mobile", events.filter((e) => e.event === "sticky_click").length],
    ["Perfil opcional salvo", events.filter((e) => e.event === "demographics_saved").length],
  ];

  // Autoposicionamento × medido
  const selfRows = [1, 2, 3, 4, 5, 6, 7].map((v) => {
    const rs = results.filter((r) => r.self_placement === v);
    return { v, n: rs.length, econ: mean(rs.map((r) => r.econ)), cost: mean(rs.map((r) => r.costumes)), inst: mean(rs.map((r) => r.instituicoes)) };
  });

  const axisStats = AXES.map((a) => {
    const vals = results.map((r) => r[a.id]);
    return { axis: a, vals, avg: mean(vals), neg: vals.filter((v) => v <= -20).length, pos: vals.filter((v) => v >= 20).length };
  });

  return (
    <div className="max-w-6xl mx-auto pt-4 sm:pt-8 grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker mb-1">Painel</p>
          <h1 className="text-3xl font-black text-navy m-0">The Spectrum · resultados e métricas</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {PERIODS.map((p) => (
            <Link key={p.key} href={`/admin?dias=${p.key}`} className={`btn btn-sm ${p.key === period.key ? "btn-primary" : "btn-ghost"}`}>
              {p.label}
            </Link>
          ))}
          <a href={`/admin/export?dias=${period.days}`} className="btn btn-ghost btn-sm">
            Exportar CSV
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Kpi label="Respostas" value={n} sub={`${last24} nas últimas 24h`} />
        <Kpi label="Com e-mail" value={withEmail} sub={`${pct(withEmail, n)} das respostas`} />
        <Kpi label="Aceitam novidades" value={newsletter} sub={`${pct(newsletter, withEmail)} dos e-mails`} />
        <Kpi label="Instrumento v2" value={results.filter((r) => r.instrument_version === 2).length} sub={`${results.filter((r) => r.instrument_version < 2).length} na v1`} />
        <Kpi label="Celular" value={pct(results.filter((r) => r.device === "mobile").length, results.filter((r) => r.device).length)} sub="dos que informaram" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Section title="Respostas por dia" note="Últimos 14 dias com respostas no período.">
          {series.length ? (
            <div className="flex items-end gap-1 h-32">
              {series.map(([d, v]) => (
                <div key={d} className="flex-1 h-full flex flex-col justify-end items-center gap-1 min-w-0" title={`${d}: ${v}`}>
                  <span className="text-[10px] text-muted tabular-nums">{v}</span>
                  <div className="w-full bg-navy rounded-t" style={{ height: `${Math.max(2, (80 * v) / seriesMax)}%` }} />
                  <span className="text-[10px] text-muted truncate w-full text-center">{d}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted m-0">Sem respostas no período.</p>
          )}
        </Section>

        <Section title="Funil (sessões únicas)" note="Eventos anônimos registrados a partir de 16/09/2026; respostas anteriores não aparecem aqui.">
          <Bars rows={funnel} total={funnel[0][1]} />
          <div className="rule mt-4 pt-4">
            <Bars rows={clicks} total={Math.max(1, sessions("quiz_complete"))} />
          </div>
        </Section>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {axisStats.map(({ axis, vals, avg, neg, pos }) => (
          <Section key={axis.id} title={axis.name} note={`${axis.negativePole} ← → ${axis.positivePole}`}>
            <Histogram values={vals} />
            <div className="flex justify-between text-xs text-muted mt-2">
              <span>{axis.negativePole}: {pct(neg, n)}</span>
              <span className="font-bold text-navy">média {avg == null ? "—" : fmt(avg)}</span>
              <span>{axis.positivePole}: {pct(pos, n)}</span>
            </div>
          </Section>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Section title="Perfis" note="Rótulo atribuído a cada resultado.">
          <Bars rows={count(results, (r) => r.label)} total={n} />
        </Section>
        <Section title="Origem do tráfego" note="utm_source do anúncio ou domínio de onde a pessoa veio (só nas respostas que informaram).">
          <Bars rows={count(results, (r) => r.utm_source ?? "(direto / sem origem)")} total={n} />
          <div className="rule mt-4 pt-4">
            <p className="kicker m-0 mb-2">Campanhas</p>
            <Bars rows={count(results, (r) => r.utm_campaign)} total={n} />
          </div>
        </Section>
      </div>

      <Section title="Como a pessoa se define × o que o teste mede" note="Autoposicionamento 1 (esquerda) a 7 (direita), perguntado antes do resultado. Se o teste está calibrado, as médias devem crescer da esquerda para a direita.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted">
                <th className="py-1 pr-3 font-normal">Se define como</th>
                <th className="py-1 pr-3 font-normal tabular-nums">n</th>
                <th className="py-1 pr-3 font-normal">Economia</th>
                <th className="py-1 pr-3 font-normal">Costumes</th>
                <th className="py-1 pr-3 font-normal">Instituições</th>
              </tr>
            </thead>
            <tbody>
              {selfRows.map((r) => (
                <tr key={r.v} className="border-t border-rule">
                  <td className="py-1.5 pr-3">
                    {r.v} · {SELF_PLACEMENT_LABELS[r.v]}
                  </td>
                  <td className="py-1.5 pr-3 tabular-nums">{r.n}</td>
                  <td className="py-1.5 pr-3 tabular-nums">{r.econ == null ? "—" : fmt(r.econ)}</td>
                  <td className="py-1.5 pr-3 tabular-nums">{r.cost == null ? "—" : fmt(r.cost)}</td>
                  <td className="py-1.5 pr-3 tabular-nums">{r.inst == null ? "—" : fmt(r.inst)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Section title="Estado" note="Top 10, entre quem informou.">
          <Bars rows={count(results, (r) => r.uf).slice(0, 10)} total={results.filter((r) => r.uf).length} />
        </Section>
        <Section title="Faixa etária" note="Entre quem informou.">
          <Bars rows={[...AGES].map((a) => [a, results.filter((r) => r.age_range === a).length] as [string, number]).filter((x) => x[1] > 0)} total={results.filter((r) => r.age_range).length} />
        </Section>
        <Section title="Escolaridade" note="Entre quem informou.">
          <Bars rows={count(results, (r) => r.education)} total={results.filter((r) => r.education).length} labelOf={(k) => EDUCATION[k as keyof typeof EDUCATION] ?? k} />
        </Section>
        <Section title="Voto no 2º turno de 2022" note="Entre quem informou.">
          <Bars rows={count(results, (r) => r.vote_2022)} total={results.filter((r) => r.vote_2022).length} labelOf={(k) => VOTE_2022[k as keyof typeof VOTE_2022] ?? k} />
        </Section>
      </div>

      <Section title="Últimos resultados" note="50 mais recentes. Nunca mostra e-mail nem respostas individuais.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="text-left text-muted">
                {["Quando", "Perfil", "Econ.", "Cost.", "Inst.", "Se define", "UF", "Idade", "Origem", "E-mail", "Link"].map((h) => (
                  <th key={h} className="py-1 pr-3 font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.slice(0, 50).map((r: ResultRow) => (
                <tr key={r.id} className="border-t border-rule">
                  <td className="py-1.5 pr-3 tabular-nums">{new Date(r.created_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</td>
                  <td className="py-1.5 pr-3">{r.label}</td>
                  <td className="py-1.5 pr-3 tabular-nums">{fmt(r.econ)}</td>
                  <td className="py-1.5 pr-3 tabular-nums">{fmt(r.costumes)}</td>
                  <td className="py-1.5 pr-3 tabular-nums">{fmt(r.instituicoes)}</td>
                  <td className="py-1.5 pr-3 tabular-nums">{r.self_placement ?? "—"}</td>
                  <td className="py-1.5 pr-3">{r.uf ?? "—"}</td>
                  <td className="py-1.5 pr-3">{r.age_range ?? "—"}</td>
                  <td className="py-1.5 pr-3">{r.utm_source ?? "—"}</td>
                  <td className="py-1.5 pr-3">{unlockedIds.has(r.id) ? "sim" : "—"}</td>
                  <td className="py-1.5 pr-3">
                    <a href={`/r/${r.id}`} target="_blank" rel="noopener" className="underline text-navy">
                      abrir
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

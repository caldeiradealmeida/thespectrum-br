import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { AXES } from "@/lib/instrument";
import { axisDescription, intensity, side } from "@/lib/scoring";
import { getStore } from "@/lib/db";
import { siteUrl } from "@/lib/site";
import { candidatesEnabled, computeAlignment } from "@/lib/candidates";
import { AxisBar } from "@/components/AxisBar";
import { ShareButtons } from "@/components/ShareButtons";
import { UnlockForm } from "@/components/UnlockForm";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;
type Search = Promise<{ t?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const result = await getStore().getResult(id);
  if (!result) return { title: "Resultado não encontrado" };
  const title = `Meu perfil: ${result.label}`;
  const description = `Economia ${fmt(result.econ)} · Costumes ${fmt(result.costumes)} · Instituições ${fmt(result.instituicoes)}. Descubra o seu no The Spectrum.`;
  return {
    title,
    description,
    openGraph: { title, description, url: `${siteUrl()}/r/${id}` },
    twitter: { title, description },
    robots: { index: false, follow: true },
  };
}

function fmt(n: number) {
  return `${n > 0 ? "+" : ""}${n}`;
}

export default async function ResultPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { id } = await params;
  const { t } = await searchParams;
  const store = getStore();
  const result = await store.getResult(id);
  if (!result) notFound();

  const scores = { econ: result.econ, costumes: result.costumes, instituicoes: result.instituicoes };
  const jar = await cookies();
  const cookieToken = jar.get(`sp_unlock_${id}`)?.value;
  const unlocked = cookieToken === result.unlock_token || t === result.unlock_token;

  const [pct, report] = await Promise.all([
    store.percentiles(scores).catch(() => null),
    unlocked ? store.getReport(id) : Promise.resolve(null),
  ]);

  const url = `${siteUrl()}/r/${id}`;
  const showCandidates = unlocked && candidatesEnabled();
  const alignment = showCandidates ? computeAlignment(scores).slice(0, 5) : [];

  return (
    <div className="max-w-3xl mx-auto pt-6 sm:pt-12">
      {/* ---------------------------------------------------- Camada 1 */}
      <p className="kicker mb-3">Seu resultado</p>
      <h1 className="text-4xl sm:text-5xl font-black text-navy leading-tight tracking-tight m-0">{result.label}</h1>
      <p className="text-navy-soft mt-3 mb-8 max-w-2xl leading-relaxed">
        Esse nome resume a combinação das suas posições nos três eixos. Ele descreve, não julga — e vale como ponto de
        partida, não como sentença.
      </p>

      <div className="card p-6 sm:p-8">
        {AXES.map((axis) => (
          <AxisBar
            key={axis.id}
            axis={axis}
            score={scores[axis.id]}
            percentile={pct && pct.n >= 30 ? pct[`${axis.id}_pct`] : null}
          />
        ))}
        {pct && pct.n >= 30 && (
          <p className="text-xs text-muted mt-2 mb-0">Comparação com {pct.n.toLocaleString("pt-BR")} participantes até agora.</p>
        )}
      </div>

      <div className="grid gap-4 mt-6">
        {AXES.map((axis) => {
          const s = scores[axis.id];
          const pole = side(s) === "neg" ? axis.negativePole : side(s) === "pos" ? axis.positivePole : "Centro";
          return (
            <div key={axis.id} className="quiet p-5">
              <p className="kicker mb-1">
                {axis.name} · {pole} · {intensity(s)}
              </p>
              <p className="m-0 leading-relaxed">{axisDescription(axis.id, s)}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <p className="kicker mb-2">Compartilhe</p>
        <ShareButtons url={url} label={result.label} />
        <p className="text-xs text-muted mt-2 mb-0">
          O link mostra apenas o seu perfil e os três escores — nunca as respostas individuais.
        </p>
      </div>

      {/* ---------------------------------------------------- Camada 2 */}
      <section className="mt-14">
        {unlocked ? (
          <>
            <p className="kicker mb-2">Relatório completo</p>
            <h2 className="text-2xl sm:text-3xl font-black text-navy m-0 mb-5">A leitura por trás dos números</h2>
            <div className="card p-6 sm:p-8 prose-report">
              {report ? (
                <ReactMarkdown>{report}</ReactMarkdown>
              ) : (
                <p className="m-0 text-muted">Seu relatório está sendo preparado. Recarregue a página em instantes.</p>
              )}
            </div>

            {showCandidates && (
              <div className="mt-8">
                <p className="kicker mb-2">Proximidade com candidaturas à Presidência</p>
                <div className="card p-6 sm:p-8">
                  <p className="text-sm text-muted mt-0 mb-4 leading-relaxed">
                    Proximidade entre as suas posições e as posições públicas de cada chapa nos três eixos, de 0 a 100.
                    Não é previsão de voto nem recomendação: é uma régua para você conferir com o programa de governo de
                    cada uma.
                  </p>
                  <ol className="m-0 p-0 list-none grid gap-3">
                    {alignment.map((a) => (
                      <li key={a.candidate.id} className="flex items-center gap-4">
                        <span className="font-black text-navy tabular-nums w-10 text-right">{a.score}</span>
                        <span className="flex-1">
                          <span className="font-bold text-navy">{a.candidate.name}</span>{" "}
                          <span className="text-muted text-sm">({a.candidate.party})</span>
                          {a.candidate.registration === "pendente" && (
                            <span className="text-xs text-amber ml-2">registro pendente no TSE</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="callout p-7 sm:p-9">
            <p className="kicker mb-2" style={{ color: "var(--accent)" }}>
              Camada 2 · gratuita, com seu e-mail
            </p>
            <h2 className="text-2xl sm:text-3xl font-black m-0 mb-3">Quer entender o porquê?</h2>
            <p className="leading-relaxed opacity-90 mb-6">
              Um relatório escrito para você a partir das suas 24 respostas: onde você é mais firme, as tensões entre suas
              posições, o melhor argumento de quem pensa o oposto e três leituras — uma alinhada, uma de contraponto, uma
              de síntese.
            </p>
            <UnlockForm resultId={id} />
          </div>
        )}
      </section>

      <div className="mt-12 flex flex-wrap items-center gap-4 text-sm">
        <Link href="/teste" className="btn btn-ghost btn-sm">
          Refazer o teste
        </Link>
        <Link href="/metodologia" className="text-navy-soft underline">
          Como o resultado é calculado
        </Link>
      </div>
    </div>
  );
}

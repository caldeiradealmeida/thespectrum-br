import { AXES, AxisId } from "./instrument";
import { Scores } from "./scoring";

/**
 * Alinhamento com candidatos à Presidência — eleição de 2026.
 *
 * Posições estimadas em 16/09/2026 a partir de programas de governo (TSE /
 * imprensa) e declarações públicas — evidência por eixo e alertas no
 * documento do projeto `claude/candidatos-2026.md`. Revisado e liberado por
 * Denis em 24/09/2026. A tabela completa é pública em /metodologia.
 *
 * Chapas conforme TSE (11/09/2026 — 12 candidaturas; Marçal indeferido e
 * substituído por Leonardo Avalanche, registro "em julgamento" em 24/09):
 * https://www.tse.jus.br/comunicacao/noticias/2026/Setembro/eleicoes-2026-tem-12-candidaturas-na-disputa-pela-presidencia-da-republica
 */

export interface Candidate {
  id: string;
  name: string;
  party: string;
  vice: string;
  /** Situação do registro no TSE na data da última revisão. */
  registration: "deferido" | "pendente";
  positions: Scores;
  confidence: "baixa" | "media" | "alta";
  source: string | null;
  reviewedAt: string | null;
}

export const CANDIDATES: Candidate[] = [
  { id: "lula", name: "Luiz Inácio Lula da Silva", party: "PT", vice: "Geraldo Alckmin (PSB)", registration: "deferido", positions: { econ: -60, costumes: -40, instituicoes: -55 }, confidence: "alta", source: "https://www.gazetadopovo.com.br/eleicoes/2026/plano-de-governo-lula-economia/ | https://www.em.com.br/politica/2026/08/7490597-lula-2026-conheca-as-propostas-do-candidato-a-presidencia.html | https://www.cnnbrasil.com.br/politica/governo-lula-limita-acesso-de-cacs-a-armas-e-repassa-fiscalizacao-para-a-pf-veja-medidas/", reviewedAt: "2026-09-24" },
  { id: "flavio-bolsonaro", name: "Flávio Bolsonaro", party: "PL", vice: "Alfredo Gaspar", registration: "deferido", positions: { econ: 55, costumes: 70, instituicoes: 85 }, confidence: "alta", source: "https://www.poder360.com.br/poder-eleicoes-2026/plano-de-governo-de-flavio-mira-reforma-no-stf-e-tesouraco-na-economia/ | https://www.gazetadopovo.com.br/eleicoes/2026/propostas-flavio-bolsonaro-plano-de-governo-seguranca-publica/", reviewedAt: "2026-09-24" },
  { id: "zema", name: "Romeu Zema", party: "Novo", vice: "Eduardo Girão", registration: "deferido", positions: { econ: 95, costumes: 50, instituicoes: 75 }, confidence: "alta", source: "https://www.gazetadopovo.com.br/eleicoes/2026/plano-de-governo-zema-economia/ | https://www.congressoemfoco.com.br/noticia/121274/plano-de-zema-preve-choque-fiscal--limitacao-ao-stf-e-saida-do-brics", reviewedAt: "2026-09-24" },
  { id: "caiado", name: "Ronaldo Caiado", party: "PSD", vice: "Gilberto Kassab", registration: "deferido", positions: { econ: 45, costumes: 60, instituicoes: 75 }, confidence: "media", source: "https://www.poder360.com.br/poder-eleicoes-2026/ronaldo-caiado-propoe-fim-da-reeleicao-e-combate-a-terrorismo-domestico/ | https://www.otempo.com.br/eleicoes/2026/presidentes/2026/8/25/caiado-entrevista-globo-jornal-nacional", reviewedAt: "2026-09-24" },
  { id: "renan-santos", name: "Renan Santos", party: "Missão", vice: "Aroldo Medina", registration: "deferido", positions: { econ: 80, costumes: 55, instituicoes: 90 }, confidence: "alta", source: "https://www.gazetadopovo.com.br/eleicoes/2026/como-renan-santos-pretende-restaurar-o-brasil-plano-de-governo-candidato-missao/ | https://www.cnnbrasil.com.br/eleicoes/renan-santos-propoe-foco-em-seguranca-e-reformas-em-plano-de-governo/", reviewedAt: "2026-09-24" },
  { id: "cury", name: "Augusto Cury", party: "Avante", vice: "Júlio Delgado", registration: "deferido", positions: { econ: 40, costumes: 35, instituicoes: 45 }, confidence: "media", source: "https://www.terra.com.br/noticias/eleicoes/eleicoes-2026-plano-de-augusto-cury-preve-semipresidencialismo-gestao-da-emocao-e-telemedicina,275f8d4dd7b40fb5b714d19aeb7b0f1c9tfiftut.html | https://www.cnnbrasil.com.br/eleicoes/daria-perdao-a-quase-todos-envolvidos-no-8-1-diz-augusto-cury-a-cnn/", reviewedAt: "2026-09-24" },
  { id: "samara", name: "Samara Martins", party: "UP", vice: "Raquel Brício", registration: "deferido", positions: { econ: -95, costumes: -90, instituicoes: -90 }, confidence: "alta", source: "https://www.band.com.br/politica/eleicoes/eleicoes-2026-conheca-as-propostas-e-o-perfil-de-samara-martins-up | https://almapreta.com.br/sessao/politica/samara-martins-programa-governo-eleicoes-2026/", reviewedAt: "2026-09-24" },
  { id: "hertz", name: "Hertz Dias", party: "PSTU", vice: "Vanessa Portugal", registration: "deferido", positions: { econ: -95, costumes: -90, instituicoes: -90 }, confidence: "alta", source: "https://www.correiobraziliense.com.br/politica/2026/08/7489635-quem-e-hertz-dias-o-rapper-candidato-a-presidente-pelo-pstu.html | https://www.metropoles.com/brasil/em-plano-presidenciavel-do-pstu-propoe-enfrentar-o-imperialismo", reviewedAt: "2026-09-24" },
  { id: "edmilson", name: "Edmilson Costa", party: "PCB", vice: "Cleusa Santos", registration: "deferido", positions: { econ: -100, costumes: -90, instituicoes: -85 }, confidence: "alta", source: "https://static.poder360.com.br/uploads/2026/08/Plano_gov_Edmilson_Costa_PCB_2026.pdf", reviewedAt: "2026-09-24" },
  { id: "pimenta", name: "Rui Costa Pimenta", party: "PCO", vice: "Antônio Carlos", registration: "deferido", positions: { econ: -100, costumes: -50, instituicoes: -40 }, confidence: "baixa", source: "https://www.band.com.br/politica/eleicoes/eleicoes-2026-conheca-as-propostas-e-o-perfil-de-rui-costa-pimenta-pco | https://causaoperaria.org.br/2026/rui-costa-pimenta-crise-do-stf-ameaca-pt-e-expoe-ditadura-judicial/", reviewedAt: "2026-09-24" },
  { id: "clariana", name: "Clariana Barão", party: "DC", vice: "Fabiana Torquato", registration: "deferido", positions: { econ: 55, costumes: 75, instituicoes: 50 }, confidence: "media", source: "https://revistaforum.com.br/politica/clariana-barao-e-de-esquerda-ou-de-direita-entenda-o-posicionamento-da-candidata-a-presidencia/ | https://www.band.com.br/politica/eleicoes/eleicoes-2026-conheca-o-perfil-e-as-propostas-de-clariana-barao-dc", reviewedAt: "2026-09-24" },
  { id: "grassi", name: "Wilson Grassi", party: "Democrata", vice: "Suêd Haidar", registration: "deferido", positions: { econ: 50, costumes: 40, instituicoes: 70 }, confidence: "baixa", source: "https://revistaforum.com.br/politica/wilson-grassi-de-esquerda/ | https://www.correiobraziliense.com.br/politica/2026/08/7489311-quem-e-wilson-grassi-candidato-a-presidencia-pelo-democrata.html", reviewedAt: "2026-09-24" },
  { id: "avalanche", name: "Leonardo Avalanche", party: "PRTB", vice: "Silvia Helena da Silva Pereira", registration: "pendente", positions: { econ: 60, costumes: 70, instituicoes: 70 }, confidence: "baixa", source: "https://www.gazetadopovo.com.br/eleicoes/2026/prtb-lanca-leonardo-avalanche-a-presidencia-apos-tse-barrar-candidatura-de-marcal/ | https://sbtnews.sbt.com.br/colunas/coluna-do-ranier/pablo-marcal-retifica-bens-e-protocola-plano-com-7-missoes", reviewedAt: "2026-09-24" },
];

/**
 * Ligado desde 24/09/2026 (revisão de Denis). Para desligar sem deploy:
 * CANDIDATES_ENABLED=off na Vercel. Qualquer outro valor (inclusive o antigo
 * "false") mantém ligado.
 */
export function candidatesEnabled(): boolean {
  return process.env.CANDIDATES_ENABLED !== "off";
}

export interface Alignment {
  candidate: Candidate;
  /** 0–100: 100 = mesma posição nos três eixos. */
  score: number;
  perAxis: Record<AxisId, number>;
}

/**
 * Distância euclidiana normalizada nos três eixos (0–100). Não é "intenção
 * de voto" nem previsão — é proximidade de posições declaradas.
 */
export function computeAlignment(scores: Scores, list: Candidate[] = CANDIDATES): Alignment[] {
  const maxDist = Math.sqrt(3 * 200 * 200);
  return list
    .map((candidate) => {
      const perAxis = {} as Record<AxisId, number>;
      let sq = 0;
      for (const axis of AXES) {
        const d = scores[axis.id] - candidate.positions[axis.id];
        sq += d * d;
        perAxis[axis.id] = Math.round(100 - (Math.abs(d) / 200) * 100);
      }
      const score = Math.round(100 - (Math.sqrt(sq) / maxDist) * 100);
      return { candidate, score, perAxis };
    })
    .sort((a, b) => b.score - a.score);
}

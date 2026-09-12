import { AXES, AxisId } from "./instrument";
import { Scores } from "./scoring";

/**
 * Alinhamento com candidatos à Presidência — eleição de 2026.
 *
 * ATENÇÃO: os posicionamentos abaixo são um RASCUNHO de trabalho, estimados a
 * partir da orientação programática conhecida de cada partido/candidatura,
 * NÃO a partir de leitura item a item dos programas de governo registrados no
 * TSE. Antes de ligar a funcionalidade em produção (CANDIDATES_ENABLED=true),
 * cada linha deve ser revisada por uma pessoa com base em fonte pública
 * citável (programa de governo no DivulgaCand, votações nominais, declarações
 * registradas) e o campo `source` preenchido.
 *
 * Lista de chapas conforme TSE (notícias de 02/09 e 09/09/2026):
 * https://www.tse.jus.br/comunicacao/noticias/2026/Setembro/tse-valida-seis-registros-de-candidatura-a-presidencia-da-republica
 * https://www.tse.jus.br/comunicacao/noticias/2026/Setembro/tse-valida-mais-tres-registros-de-candidatura-a-presidencia-da-republica
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
  { id: "lula", name: "Luiz Inácio Lula da Silva", party: "PT", vice: "Geraldo Alckmin (PSB)", registration: "deferido", positions: { econ: -60, costumes: -35, instituicoes: -45 }, confidence: "media", source: null, reviewedAt: null },
  { id: "flavio-bolsonaro", name: "Flávio Bolsonaro", party: "PL", vice: "Alfredo Gaspar", registration: "deferido", positions: { econ: 45, costumes: 75, instituicoes: 75 }, confidence: "media", source: null, reviewedAt: null },
  { id: "zema", name: "Romeu Zema", party: "Novo", vice: "Eduardo Girão", registration: "deferido", positions: { econ: 85, costumes: 40, instituicoes: 40 }, confidence: "media", source: null, reviewedAt: null },
  { id: "caiado", name: "Ronaldo Caiado", party: "PSD", vice: "Gilberto Kassab", registration: "deferido", positions: { econ: 40, costumes: 55, instituicoes: 65 }, confidence: "media", source: null, reviewedAt: null },
  { id: "renan-santos", name: "Renan Santos", party: "Missão", vice: "Aroldo Medina", registration: "deferido", positions: { econ: 70, costumes: 45, instituicoes: 55 }, confidence: "baixa", source: null, reviewedAt: null },
  { id: "marcal", name: "Pablo Marçal", party: "PRTB", vice: "Leonardo Avalanche", registration: "pendente", positions: { econ: 60, costumes: 60, instituicoes: 65 }, confidence: "baixa", source: null, reviewedAt: null },
  { id: "cury", name: "Augusto Cury", party: "Avante", vice: "Júlio Delgado", registration: "pendente", positions: { econ: 20, costumes: 30, instituicoes: 20 }, confidence: "baixa", source: null, reviewedAt: null },
  { id: "samara", name: "Samara Martins", party: "UP", vice: "Raquel Brício", registration: "deferido", positions: { econ: -90, costumes: -80, instituicoes: -70 }, confidence: "media", source: null, reviewedAt: null },
  { id: "hertz", name: "Hertz Dias", party: "PSTU", vice: "Vanessa Portugal", registration: "deferido", positions: { econ: -95, costumes: -85, instituicoes: -75 }, confidence: "media", source: null, reviewedAt: null },
  { id: "edmilson", name: "Edmilson Costa", party: "PCB", vice: "Cleusa Santos", registration: "deferido", positions: { econ: -95, costumes: -80, instituicoes: -70 }, confidence: "media", source: null, reviewedAt: null },
  { id: "pimenta", name: "Rui Costa Pimenta", party: "PCO", vice: "Antônio Carlos", registration: "deferido", positions: { econ: -95, costumes: -70, instituicoes: -60 }, confidence: "baixa", source: null, reviewedAt: null },
  { id: "clariana", name: "Clariana Barão", party: "DC", vice: "Fabiana Torquato", registration: "deferido", positions: { econ: 40, costumes: 80, instituicoes: 60 }, confidence: "baixa", source: null, reviewedAt: null },
  { id: "grassi", name: "Wilson Grassi", party: "Democrata", vice: "Suêd Haidar", registration: "deferido", positions: { econ: 30, costumes: 50, instituicoes: 50 }, confidence: "baixa", source: null, reviewedAt: null },
];

export function candidatesEnabled(): boolean {
  return process.env.CANDIDATES_ENABLED === "true";
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

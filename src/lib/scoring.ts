import { AXES, AxisId, QUESTIONS, SCALE_MAX, SCALE_MIN } from "./instrument";

export type Scores = Record<AxisId, number>;
export type Answers = Record<string, number>; // questionId -> 1..7

/** Abaixo deste módulo o eixo é considerado "centro". */
export const CENTER_BAND = 20;

export function isComplete(answers: Answers): boolean {
  return QUESTIONS.every((q) => {
    const v = answers[q.id];
    return Number.isInteger(v) && v >= SCALE_MIN && v <= SCALE_MAX;
  });
}

/**
 * Converte respostas em escores por eixo, de −100 a +100.
 * Cada item contribui com (valor − ponto médio) / amplitude × chave.
 */
export function computeScores(answers: Answers): Scores {
  const mid = (SCALE_MIN + SCALE_MAX) / 2; // 4
  const half = (SCALE_MAX - SCALE_MIN) / 2; // 3
  const acc: Record<AxisId, { sum: number; n: number }> = {
    econ: { sum: 0, n: 0 },
    costumes: { sum: 0, n: 0 },
    instituicoes: { sum: 0, n: 0 },
  };
  for (const q of QUESTIONS) {
    const v = answers[q.id];
    if (v === undefined) continue;
    acc[q.axis].sum += ((v - mid) / half) * q.key;
    acc[q.axis].n += 1;
  }
  const out = {} as Scores;
  for (const axis of AXES) {
    const { sum, n } = acc[axis.id];
    out[axis.id] = n ? Math.round((sum / n) * 100) : 0;
  }
  return out;
}

export type Side = "neg" | "center" | "pos";

export function side(score: number): Side {
  if (score <= -CENTER_BAND) return "neg";
  if (score >= CENTER_BAND) return "pos";
  return "center";
}

/** Intensidade em palavras, para o texto do resultado. */
export function intensity(score: number): string {
  const a = Math.abs(score);
  if (a < CENTER_BAND) return "equilibrado";
  if (a < 45) return "moderado";
  if (a < 70) return "claro";
  return "forte";
}

/**
 * Rótulo do perfil. Nomes deliberadamente descritivos e neutros — nada de
 * "extrema". A base vem da combinação Economia × Costumes; o eixo de
 * Instituições qualifica o nome quando está fora do centro.
 */
const BASE_LABELS: Record<string, string> = {
  "neg|neg": "Progressista",
  "neg|center": "Social-democrata",
  "neg|pos": "Trabalhista conservador",
  "center|neg": "Progressista pragmático",
  "center|center": "Centrista",
  "center|pos": "Conservador moderado",
  "pos|neg": "Liberal",
  "pos|center": "Liberal pragmático",
  "pos|pos": "Liberal-conservador",
};

export function profileLabel(scores: Scores): string {
  const e = side(scores.econ);
  const c = side(scores.costumes);
  const i = side(scores.instituicoes);
  let label = BASE_LABELS[`${e}|${c}`];
  if (i === "pos") label += " de ordem";
  if (i === "neg") label += " garantista";
  if (e === "center" && c === "center" && i === "center") label = "Centrista";
  return label;
}

export function axisDescription(axisId: AxisId, score: number): string {
  const axis = AXES.find((a) => a.id === axisId)!;
  const s = side(score);
  if (s === "neg") return axis.negativeDescription;
  if (s === "pos") return axis.positiveDescription;
  return axis.centerDescription;
}

/** Posição de 0 a 100 para desenhar na barra (0 = polo negativo). */
export function toBarPosition(score: number): number {
  return Math.round(((score + 100) / 200) * 100);
}

/**
 * Perguntas em que a pessoa tomou posição forte (|contribuição| >= 2/3),
 * ordenadas por intensidade. Usado pelo relatório e pelo contraponto.
 */
export function strongestPositions(answers: Answers, limit = 6) {
  const mid = (SCALE_MIN + SCALE_MAX) / 2;
  const half = (SCALE_MAX - SCALE_MIN) / 2;
  return QUESTIONS.map((q) => {
    const v = answers[q.id];
    const contribution = v === undefined ? 0 : ((v - mid) / half) * q.key;
    return { question: q, value: v, contribution };
  })
    .filter((x) => Math.abs(x.contribution) >= 2 / 3)
    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
    .slice(0, limit);
}

/**
 * Dado mais notável do perfil, para o teaser que aponta para a camada 2.
 * Prioriza o eixo em que a pessoa mais destoa da média dos participantes
 * (quando há média); senão, o eixo de posição mais firme.
 */
export function notableFact(
  scores: Scores,
  averages: Partial<Record<AxisId, number | null>> | null,
): { axis: AxisId; headline: string; detail: string } | null {
  const withAvg = AXES.map((a) => {
    const avg = averages?.[a.id];
    return { axis: a, score: scores[a.id], avg: avg == null ? null : avg };
  });

  const comparable = withAvg.filter((x) => x.avg != null) as { axis: (typeof AXES)[number]; score: number; avg: number }[];
  if (comparable.length) {
    const top = comparable.sort((a, b) => Math.abs(b.score - b.avg) - Math.abs(a.score - a.avg))[0];
    const diff = Math.round(top.score - top.avg);
    if (Math.abs(diff) >= 15) {
      const towards = diff > 0 ? top.axis.positivePole : top.axis.negativePole;
      return {
        axis: top.axis.id,
        headline: `Em ${top.axis.name}, você está ${Math.abs(diff)} pontos mais para “${towards}” que a média dos participantes.`,
        detail: "Uma das suas posições é mais rara do que parece. O relatório explica por quê — e o que o outro lado diria.",
      };
    }
  }

  const strongest = [...AXES].sort((a, b) => Math.abs(scores[b.id]) - Math.abs(scores[a.id]))[0];
  const s = scores[strongest.id];
  if (Math.abs(s) < CENTER_BAND) {
    return {
      axis: strongest.id,
      headline: "Você ficou perto do centro nos três eixos — o que é menos comum do que parece.",
      detail: "O relatório mostra em quais temas você tomou partido mesmo assim, e onde está a tensão.",
    };
  }
  const pole = s > 0 ? strongest.positivePole : strongest.negativePole;
  return {
    axis: strongest.id,
    headline: `Sua posição mais firme é em ${strongest.name}: ${intensity(s)} para “${pole}”.`,
    detail: "O relatório mostra o que sustenta essa posição, onde ela entra em tensão com as outras e o melhor argumento do outro lado.",
  };
}

import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { AXES, QUESTIONS, SCALE_LABELS } from "./instrument";
import { READINGS } from "./readings";
import { Answers, Scores, axisDescription, intensity, profileLabel, side, strongestPositions } from "./scoring";

export const REPORT_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5";

export interface ReportResult {
  markdown: string;
  model: string;
}

/**
 * Relatório da camada 2. Com ANTHROPIC_API_KEY, gera um texto narrativo
 * personalizado; sem a chave, monta um relatório determinístico a partir das
 * descrições dos eixos, para o produto nunca ficar sem resposta.
 */
export async function generateReport(scores: Scores, answers: Answers): Promise<ReportResult> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { markdown: fallbackReport(scores, answers), model: "template" };
  try {
    const client = new Anthropic({ apiKey: key });
    const msg = await client.messages.create({
      model: REPORT_MODEL,
      max_tokens: 1800,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(scores, answers) }],
    });
    const text = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    if (!text) throw new Error("resposta vazia");
    return { markdown: text, model: REPORT_MODEL };
  } catch (err) {
    console.error("[spectrum] falha ao gerar relatório por IA; usando template", err);
    return { markdown: fallbackReport(scores, answers), model: "template-fallback" };
  }
}

const SYSTEM_PROMPT = `Você escreve relatórios de posicionamento político para o The Spectrum, um instrumento brasileiro com três eixos: Economia (Estado ↔ Mercado), Costumes (Progressista ↔ Conservador) e Instituições e segurança (Garantista ↔ Ordem). Escores vão de −100 a +100; o sinal negativo aponta para o primeiro polo de cada eixo.

Regras:
- Escreva em português do Brasil, em segunda pessoa ("você"), tom sóbrio e respeitoso, sem julgamento. Nunca use "extrema", "radical" ou termos pejorativos para descrever a pessoa ou qualquer campo político.
- Seja concreto: cite as afirmações com que a pessoa mais concordou ou discordou, pelo tema, e explique o que isso revela.
- Não invente fatos, estatísticas, candidatos ou livros. Recomende leituras APENAS da lista fornecida.
- Não diga em quem a pessoa deveria votar nem mencione candidatos.
- Formato: Markdown com exatamente estas seções, nesta ordem:
  ## Em síntese  (2 parágrafos)
  ## Onde você é mais firme  (3 a 4 frases sobre os temas de posição mais forte)
  ## Tensões no seu perfil  (2 a 3 parágrafos curtos sobre combinações de posições que costumam gerar tensão — ou, se o perfil for muito coerente, o que isso implica; dê nome ao padrão quando ele existir, por exemplo "liberal na economia e intervencionista na segurança é uma combinação comum no Brasil")
  ## O melhor argumento do outro lado  (para os 2 temas de posição mais forte, o argumento mais forte de quem pensa o oposto, apresentado com honestidade, em 1 parágrafo cada, sem caricatura)
  ## Três leituras  (3 itens: um alinhado, um contraponto e um de síntese, no formato "**Título**, Autor — por que ler", escolhidos da lista)
- Extensão total entre 450 e 650 palavras.`;

function buildUserPrompt(scores: Scores, answers: Answers): string {
  const label = profileLabel(scores);
  const lines: string[] = [];
  lines.push(`Rótulo do perfil: ${label}`);
  for (const axis of AXES) {
    const s = scores[axis.id];
    lines.push(`${axis.name}: ${s > 0 ? "+" : ""}${s} (${side(s) === "neg" ? axis.negativePole : side(s) === "pos" ? axis.positivePole : "centro"}, ${intensity(s)})`);
  }
  lines.push("", "Respostas (1 = discordo totalmente, 7 = concordo totalmente):");
  for (const q of QUESTIONS) {
    const v = answers[q.id];
    lines.push(`- [${q.axis}] ${q.topic}: "${q.text}" → ${v} (${SCALE_LABELS[v] ?? "sem resposta"})`);
  }
  lines.push("", "Lista de leituras permitidas:");
  for (const r of READINGS) {
    lines.push(`- **${r.title}**, ${r.author} [eixo ${r.axis}, lado ${r.lean}] — ${r.why}`);
  }
  return lines.join("\n");
}

// ------------------------------------------------------------- Fallback

export function fallbackReport(scores: Scores, answers: Answers): string {
  const label = profileLabel(scores);
  const strong = strongestPositions(answers, 4);
  const parts: string[] = [];

  parts.push("## Em síntese", "");
  parts.push(
    `Seu perfil foi classificado como **${label}**. Esse rótulo resume a combinação das suas posições nos três eixos, e vale mais como ponto de partida para reflexão do que como etiqueta definitiva.`,
    "",
  );
  for (const axis of AXES) {
    parts.push(`**${axis.name}.** ${axisDescription(axis.id, scores[axis.id])}`, "");
  }

  parts.push("## Onde você é mais firme", "");
  if (strong.length === 0) {
    parts.push("Você respondeu de forma moderada à maioria das afirmações: nenhuma posição se destacou como muito firme.", "");
  } else {
    parts.push(
      "As afirmações em que você tomou posição mais clara foram sobre " +
        strong.map((s) => `**${s.question.topic.toLowerCase()}**`).join(", ") +
        ". São esses os temas em que, provavelmente, você tem menos dúvida e mais convicção — e também onde vale mais a pena ouvir quem pensa diferente.",
      "",
    );
  }

  parts.push("## Tensões no seu perfil", "");
  const e = side(scores.econ);
  const i = side(scores.instituicoes);
  const c = side(scores.costumes);
  if (e === "pos" && i === "pos") {
    parts.push("Você prefere menos Estado na economia e mais Estado na segurança. É uma combinação comum no Brasil, mas ela convive com uma tensão: um Estado forte o bastante para punir com rigor também é um Estado com poder para intervir em outras áreas.", "");
  } else if (e === "neg" && i === "neg") {
    parts.push("Você quer um Estado presente na economia e contido no uso da força. A tensão aqui é prática: um Estado grande precisa de instituições fortes para não abusar do poder que você lhe dá — o que exige justamente os controles que você valoriza.", "");
  } else if (e === "neg" && c === "pos") {
    parts.push("Você combina uma visão redistributiva na economia com valores conservadores nos costumes. É um perfil muito presente no eleitorado brasileiro e pouco representado pelos partidos, que tendem a juntar economia e costumes no mesmo pacote.", "");
  } else if (e === "pos" && c === "neg") {
    parts.push("Você combina liberdade econômica com liberdade nos costumes. É a posição liberal clássica, que no Brasil costuma se sentir sem casa, porque os grandes campos políticos juntam mercado com conservadorismo ou Estado com progressismo.", "");
  } else {
    parts.push("Seu perfil não apresenta uma tensão estrutural forte entre os eixos: suas posições apontam, em geral, na mesma direção ou ficam próximas do centro.", "");
  }

  parts.push("## O melhor argumento do outro lado", "");
  for (const s of strong.slice(0, 2)) {
    parts.push(`**${s.question.topic}.** Quem pensa o oposto de você neste tema não parte necessariamente de má-fé ou de ignorância: parte de outra prioridade — segurança em vez de liberdade, ou igualdade em vez de eficiência, ou tradição em vez de mudança. Antes de descartar esse lado, vale perguntar qual é a experiência concreta que o sustenta.`, "");
  }

  parts.push("## Três leituras", "");
  const pick = (axisId: (typeof AXES)[number]["id"], lean: "neg" | "center" | "pos") =>
    READINGS.find((r) => r.axis === axisId && r.lean === lean);
  const strongestAxis = AXES.map((a) => a.id).sort((a, b) => Math.abs(scores[b]) - Math.abs(scores[a]))[0];
  const mySide = side(scores[strongestAxis]);
  const aligned = pick(strongestAxis, mySide === "center" ? "center" : mySide);
  const counter = pick(strongestAxis, mySide === "neg" ? "pos" : "neg");
  const synth = pick(strongestAxis, "center");
  for (const r of [aligned, counter, synth]) {
    if (r) parts.push(`- **${r.title}**, ${r.author} — ${r.why}`);
  }
  return parts.join("\n");
}

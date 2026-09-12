import { NextResponse } from "next/server";
import { z } from "zod";
import { INSTRUMENT_VERSION, QUESTIONS, SCALE_MAX, SCALE_MIN } from "@/lib/instrument";
import { computeScores, isComplete, profileLabel } from "@/lib/scoring";
import { getStore, newId, newToken } from "@/lib/db";

export const runtime = "nodejs";

const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

const Body = z.object({
  answers: z.record(z.string(), z.number().int().min(SCALE_MIN).max(SCALE_MAX)),
  uf: z.enum(UFS as [string, ...string[]]).optional().nullable(),
  ageRange: z.enum(["16-24", "25-34", "35-44", "45-59", "60+"]).optional().nullable(),
});

export async function POST(req: Request) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  // Mantém apenas ids conhecidos, na ordem do instrumento.
  const answers = Object.fromEntries(
    QUESTIONS.filter((q) => q.id in body.answers).map((q) => [q.id, body.answers[q.id]]),
  );
  if (!isComplete(answers)) {
    return NextResponse.json({ error: "Responda todas as afirmações." }, { status: 400 });
  }

  const scores = computeScores(answers);
  const label = profileLabel(scores);
  const id = newId();
  const token = newToken();

  await getStore().createResult({
    id,
    version: INSTRUMENT_VERSION,
    scores,
    label,
    token,
    answers,
    uf: body.uf ?? null,
    ageRange: body.ageRange ?? null,
  });

  return NextResponse.json({ id, scores, label });
}

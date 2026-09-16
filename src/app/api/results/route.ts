import { NextResponse } from "next/server";
import { z } from "zod";
import { INSTRUMENT_VERSION, QUESTIONS, SCALE_MAX, SCALE_MIN } from "@/lib/instrument";
import { computeScores, isComplete, profileLabel } from "@/lib/scoring";
import { getStore, newId, newToken } from "@/lib/db";
import { sendCapiEvent } from "@/lib/meta";
import { siteUrl } from "@/lib/site";

export const runtime = "nodejs";

const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

const short = z.string().max(120).nullable().optional();

const Body = z.object({
  answers: z.record(z.string(), z.number().int().min(SCALE_MIN).max(SCALE_MAX)),
  uf: z.enum(UFS as [string, ...string[]]).optional().nullable(),
  ageRange: z.enum(["16-24", "25-34", "35-44", "45-59", "60+"]).optional().nullable(),
  selfPlacement: z.number().int().min(1).max(7).optional().nullable(),
  eventId: z.string().max(64).optional().nullable(),
  attribution: z
    .object({ utm_source: short, utm_medium: short, utm_campaign: short, device: z.enum(["mobile", "desktop"]).nullable().optional() })
    .optional()
    .nullable(),
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
    selfPlacement: body.selfPlacement ?? null,
    attribution: body.attribution
      ? {
          utm_source: body.attribution.utm_source ?? null,
          utm_medium: body.attribution.utm_medium ?? null,
          utm_campaign: body.attribution.utm_campaign ?? null,
          device: body.attribution.device ?? null,
        }
      : null,
  });

  // Conversão para a Meta (servidor): só "concluiu o teste", sem escores.
  // Deduplicado com o Pixel pelo eventId. No-op sem consentimento ou sem chaves.
  await sendCapiEvent({
    eventName: "Lead",
    eventId: body.eventId ?? `lead-${id}`,
    sourceUrl: `${siteUrl()}/teste`,
    cookies: req.headers.get("cookie"),
    userAgent: req.headers.get("user-agent"),
  });

  return NextResponse.json({ id, scores, label });
}

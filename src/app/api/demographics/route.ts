import { NextResponse } from "next/server";
import { z } from "zod";
import { getStore } from "@/lib/db";
import { EDUCATION, VOTE_2022 } from "@/lib/demographics";

export const runtime = "nodejs";

const educationKeys = Object.keys(EDUCATION) as [keyof typeof EDUCATION, ...(keyof typeof EDUCATION)[]];
const voteKeys = Object.keys(VOTE_2022) as [keyof typeof VOTE_2022, ...(keyof typeof VOTE_2022)[]];

const Body = z.object({
  resultId: z.string().min(4).max(16),
  education: z.enum(educationKeys).nullable().optional(),
  vote2022: z.enum(voteKeys).nullable().optional(),
});

/** Bloco opcional de perfil, respondido depois do resultado. Tudo declarado, tudo pulável. */
export async function POST(req: Request) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }
  const store = getStore();
  const result = await store.getResult(body.resultId);
  if (!result) return NextResponse.json({ error: "Resultado não encontrado." }, { status: 404 });
  await store.updateDemographics(body.resultId, {
    education: body.education === undefined ? undefined : body.education,
    vote2022: body.vote2022 === undefined ? undefined : body.vote2022,
  });
  return NextResponse.json({ ok: true });
}

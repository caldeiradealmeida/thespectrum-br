import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { getStore } from "@/lib/db";
import { generateReport } from "@/lib/report";
import { sendReportEmail } from "@/lib/email";
import { siteUrl } from "@/lib/site";

export const runtime = "nodejs";
export const maxDuration = 60;

const Body = z.object({
  resultId: z.string().min(4).max(16),
  email: z.string().email().max(200),
  consentUpdates: z.boolean().default(false),
});

export async function POST(req: Request) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
  }

  const store = getStore();
  const result = await store.getResult(body.resultId);
  if (!result) return NextResponse.json({ error: "Resultado não encontrado." }, { status: 404 });

  const email = body.email.trim().toLowerCase();
  await store.addUnlock({ resultId: result.id, email, consentUpdates: body.consentUpdates });

  // Gera (ou reaproveita) o relatório da camada 2.
  let report = await store.getReport(result.id);
  if (!report) {
    const answers = await store.getAnswers(result.id);
    const scores = { econ: result.econ, costumes: result.costumes, instituicoes: result.instituicoes };
    const generated = await generateReport(scores, answers);
    await store.saveReport(result.id, generated.markdown, generated.model);
    report = generated.markdown;
  }

  const resultUrl = `${siteUrl()}/r/${result.id}?t=${result.unlock_token}`;
  const mail = await sendReportEmail({ to: email, resultUrl, label: result.label });

  const jar = await cookies();
  jar.set(`sp_unlock_${result.id}`, result.unlock_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: `/r/${result.id}`,
    maxAge: 60 * 60 * 24 * 365,
  });

  return NextResponse.json({ ok: true, emailSent: mail.sent });
}

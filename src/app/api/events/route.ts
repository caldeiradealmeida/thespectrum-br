import { NextResponse } from "next/server";
import { z } from "zod";
import { getStore } from "@/lib/db";

export const runtime = "nodejs";

const EVENTS = [
  "page_view",
  "quiz_start",
  "quiz_complete",
  "result_view",
  "teaser_click",
  "sticky_click",
  "unlock",
  "share_click",
  "demographics_saved",
] as const;

const short = z.string().max(120).nullable().optional();

const Body = z.object({
  event: z.enum(EVENTS),
  session_id: z.string().max(40).nullable().optional(),
  result_id: z.string().max(16).nullable().optional(),
  path: z.string().max(200).nullable().optional(),
  utm_source: short,
  utm_medium: short,
  utm_campaign: short,
  device: z.enum(["mobile", "desktop"]).nullable().optional(),
  meta: z.record(z.string(), z.unknown()).nullable().optional(),
});

/** Recebe eventos anônimos de funil. Nunca registra IP nem user-agent. */
export async function POST(req: Request) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  try {
    await getStore().addEvent({
      event: body.event,
      session_id: body.session_id ?? null,
      result_id: body.result_id ?? null,
      path: body.path ?? null,
      utm_source: body.utm_source ?? null,
      utm_medium: body.utm_medium ?? null,
      utm_campaign: body.utm_campaign ?? null,
      device: body.device ?? null,
      meta: body.meta ?? null,
    });
  } catch (err) {
    console.warn("[events] falha ao gravar", err);
  }
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { getStore } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** CSV de resultados (sem e-mails, sem respostas individuais). */
export async function GET(req: Request) {
  if (!(await isAdmin())) return new NextResponse("Não autorizado", { status: 401 });
  const url = new URL(req.url);
  const dias = Number(url.searchParams.get("dias") ?? "0");
  const since = dias > 0 ? new Date(Date.now() - dias * 86400000) : new Date(0);
  const { results, unlocks } = await getStore().adminData(since);
  const unlocked = new Set(unlocks.map((u) => u.result_id));
  const cols = [
    "id","created_at","instrument_version","label","econ","costumes","instituicoes","self_placement",
    "uf","age_range","education","vote_2022","utm_source","utm_medium","utm_campaign","device","com_email",
  ];
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [cols.join(",")];
  for (const r of results) {
    lines.push(
      [
        r.id, r.created_at, r.instrument_version, r.label, r.econ, r.costumes, r.instituicoes, r.self_placement,
        r.uf, r.age_range, r.education, r.vote_2022, r.utm_source, r.utm_medium, r.utm_campaign, r.device,
        unlocked.has(r.id) ? 1 : 0,
      ].map(esc).join(","),
    );
  }
  return new NextResponse("﻿" + lines.join("\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="thespectrum-resultados-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}

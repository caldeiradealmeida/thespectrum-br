import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { AXES } from "@/lib/instrument";
import { toBarPosition } from "@/lib/scoring";
import { getStore } from "@/lib/db";

export const runtime = "nodejs";

/**
 * Imagem de compartilhamento para Instagram e afins.
 *   ?f=story  → 1080×1920 (Stories / Reels, 9:16)
 *   ?f=feed   → 1080×1350 (feed, 4:5)   [padrão]
 *   ?f=square → 1080×1080 (1:1)
 */
const FORMATS = {
  story: { w: 1080, h: 1920, padTop: 300, padBottom: 300 },
  feed: { w: 1080, h: 1350, padTop: 96, padBottom: 96 },
  square: { w: 1080, h: 1080, padTop: 72, padBottom: 72 },
} as const;

const NAVY = "#2C3A57";
const CREAM = "#F5F2EA";
const SOFT = "#425273";
const ACCENT = "#8FA8C8";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const f = (req.nextUrl.searchParams.get("f") ?? "feed") as keyof typeof FORMATS;
  const fmt = FORMATS[f] ?? FORMATS.feed;

  const store = getStore();
  const result = await store.getResult(id);
  if (!result) return new Response("Resultado não encontrado", { status: 404 });
  const scores = { econ: result.econ, costumes: result.costumes, instituicoes: result.instituicoes };
  const pct = await store.percentiles(scores).catch(() => null);
  const showAvg = !!pct && pct.n >= 10;

  const host = (process.env.NEXT_PUBLIC_SITE_URL ?? "thespectrum.com.br").replace(/^https?:\/\//, "");
  const compact = f === "square";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: NAVY,
          color: CREAM,
          padding: `${fmt.padTop}px 88px ${fmt.padBottom}px`,
          fontFamily: "Helvetica, Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 26, letterSpacing: 7, textTransform: "uppercase", color: ACCENT, fontWeight: 700 }}>
            The Spectrum · Brasil
          </div>
          <div style={{ fontSize: 24, color: ACCENT }}>Meu perfil político</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: compact ? 44 : 72 }}>
          <div style={{ fontSize: 30, color: ACCENT, marginBottom: 14 }}>Meu resultado</div>
          <div style={{ fontSize: compact ? 72 : 84, fontWeight: 700, lineHeight: 1.05, letterSpacing: -1.5 }}>{result.label}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: compact ? 56 : 84, gap: compact ? 40 : 56 }}>
          {AXES.map((axis) => {
            const s = scores[axis.id];
            const pos = toBarPosition(s);
            const avg = showAvg ? pct![`${axis.id}_avg`] : null;
            const avgPos = avg == null ? null : toBarPosition(avg);
            return (
              <div key={axis.id} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: 34, fontWeight: 700 }}>{axis.name}</span>
                  <span style={{ fontSize: 40, fontWeight: 700 }}>
                    {s > 0 ? "+" : ""}
                    {s}
                  </span>
                </div>
                <div style={{ display: "flex", position: "relative", height: 26, width: "100%" }}>
                  <div style={{ position: "absolute", left: 0, right: 0, top: 11, height: 4, background: SOFT, borderRadius: 2 }} />
                  <div style={{ position: "absolute", left: "50%", top: 4, width: 3, height: 18, background: SOFT }} />
                  <div
                    style={{
                      position: "absolute",
                      left: `${Math.min(50, pos)}%`,
                      width: `${Math.abs(pos - 50)}%`,
                      top: 11,
                      height: 4,
                      background: CREAM,
                    }}
                  />
                  {avgPos != null && (
                    <div style={{ position: "absolute", left: `${avgPos}%`, top: 2, display: "flex" }}>
                      <div style={{ marginLeft: -11, width: 22, height: 22, borderRadius: 11, border: `4px solid ${ACCENT}`, background: NAVY }} />
                    </div>
                  )}
                  <div style={{ position: "absolute", left: `${pos}%`, top: 0, display: "flex" }}>
                    <div style={{ marginLeft: -13, width: 26, height: 26, borderRadius: 13, background: CREAM }} />
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: ACCENT }}>
                  <span>{axis.negativePole}</span>
                  <span>{axis.positivePole}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
          {showAvg && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, color: ACCENT }}>
              <div style={{ width: 18, height: 18, borderRadius: 9, background: CREAM }} />
              <span>você</span>
              <div style={{ width: 18, height: 18, borderRadius: 9, border: `3px solid ${ACCENT}`, marginLeft: 10 }} />
              <span>média de {pct!.n} participantes</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 26, color: ACCENT }}>Descubra o seu · 24 afirmações · 5 minutos</span>
            <span style={{ fontSize: 28, fontWeight: 700, color: CREAM }}>{host}</span>
          </div>
        </div>
      </div>
    ),
    {
      width: fmt.w,
      height: fmt.h,
      headers: {
        "content-disposition": `inline; filename="thespectrum-${id}-${f}.png"`,
        "cache-control": "public, max-age=3600",
      },
    },
  );
}

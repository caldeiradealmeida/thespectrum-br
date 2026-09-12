import { ImageResponse } from "next/og";
import { AXES } from "@/lib/instrument";
import { toBarPosition } from "@/lib/scoring";
import { getStore } from "@/lib/db";

export const runtime = "nodejs";
export const alt = "Meu perfil no The Spectrum";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getStore().getResult(id);
  const label = result?.label ?? "The Spectrum";
  const scores = result
    ? { econ: result.econ, costumes: result.costumes, instituicoes: result.instituicoes }
    : { econ: 0, costumes: 0, instituicoes: 0 };

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#2C3A57",
          color: "#F5F2EA",
          padding: "64px 72px",
          fontFamily: "Helvetica, Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 22, letterSpacing: 6, textTransform: "uppercase", color: "#8FA8C8", fontWeight: 700 }}>
            The Spectrum · Brasil
          </div>
          <div style={{ fontSize: 20, color: "#8FA8C8" }}>Meu perfil político</div>
        </div>
        <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, marginTop: 40, letterSpacing: -1 }}>{label}</div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 48, gap: 26 }}>
          {AXES.map((axis) => {
            const s = scores[axis.id];
            const pos = toBarPosition(s);
            return (
              <div key={axis.id} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24 }}>
                  <span style={{ fontWeight: 700 }}>{axis.name}</span>
                  <span style={{ color: "#8FA8C8" }}>
                    {axis.negativePole} ↔ {axis.positivePole}
                  </span>
                </div>
                <div style={{ display: "flex", position: "relative", height: 14, width: "100%" }}>
                  <div style={{ position: "absolute", left: 0, right: 0, top: 6, height: 3, background: "#425273", borderRadius: 2 }} />
                  <div style={{ position: "absolute", left: "50%", top: 2, width: 2, height: 10, background: "#425273" }} />
                  <div
                    style={{
                      position: "absolute",
                      left: `${Math.min(50, pos)}%`,
                      width: `${Math.abs(pos - 50)}%`,
                      top: 6,
                      height: 3,
                      background: "#F5F2EA",
                    }}
                  />
                  <div style={{ position: "absolute", left: `${pos}%`, top: -2, display: "flex" }}>
                    <div style={{ marginLeft: -9, width: 18, height: 18, borderRadius: 9, background: "#F5F2EA" }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: "auto", fontSize: 22, color: "#8FA8C8" }}>Descubra o seu · 24 afirmações · 5 minutos</div>
      </div>
    ),
    size,
  );
}

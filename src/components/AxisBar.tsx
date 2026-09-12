import { Axis } from "@/lib/instrument";
import { toBarPosition } from "@/lib/scoring";

/**
 * Barra horizontal de um eixo: polos nas pontas, marcador cheio na posição
 * do usuário, marcador vazado na média dos participantes (quando houver).
 */
export function AxisBar({
  axis,
  score,
  average,
  percentile,
  compact = false,
}: {
  axis: Axis;
  score: number;
  average?: number | null;
  percentile?: number | null;
  compact?: boolean;
}) {
  const pos = toBarPosition(score);
  const avgPos = average == null ? null : toBarPosition(average);
  return (
    <div className={compact ? "py-2" : "py-4"}>
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <div>
          <span className={`font-bold text-navy ${compact ? "text-sm" : "text-base"}`}>{axis.name}</span>
          {!compact && <span className="block text-sm text-muted mt-0.5">{axis.question}</span>}
        </div>
        <span className="font-black text-navy tabular-nums text-lg">
          {score > 0 ? "+" : ""}
          {score}
        </span>
      </div>
      <div className="relative h-5 w-full" role="img" aria-label={`${axis.name}: ${score}${average != null ? `, média ${average}` : ""}`}>
        <div className="absolute left-0 right-0 top-[9px] h-[3px] rounded-full bg-rule" />
        <div className="absolute left-1/2 top-[4px] h-[13px] w-px bg-rule" />
        <div
          className="absolute top-[9px] h-[3px] bg-navy"
          style={{ left: `${Math.min(50, pos)}%`, width: `${Math.abs(pos - 50)}%` }}
        />
        {avgPos != null && (
          <div
            className="absolute top-[4px] h-[13px] w-[13px] rounded-full border-2 border-accent bg-cream"
            style={{ left: `calc(${avgPos}% - 6.5px)` }}
            title={`Média dos participantes: ${average}`}
          />
        )}
        <div
          className="absolute top-[3px] h-[15px] w-[15px] rounded-full bg-navy border-2 border-cream"
          style={{ left: `calc(${pos}% - 7.5px)` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted mt-1">
        <span>{axis.negativePole}</span>
        {percentile != null && !compact && (
          <span className="text-navy-soft text-center">
            mais para o lado &ldquo;{axis.positivePole}&rdquo; que {percentile}% dos participantes
          </span>
        )}
        <span>{axis.positivePole}</span>
      </div>
    </div>
  );
}

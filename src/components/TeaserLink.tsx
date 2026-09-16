"use client";

import { track } from "@/lib/tracking";

/** Link do teaser para a camada 2, com registro de clique. */
export function TeaserLink({ headline, detail, resultId }: { headline: string; detail: string; resultId: string }) {
  return (
    <a
      href="#camada-2"
      onClick={() => track("teaser_click", { resultId })}
      className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-[10px] border border-navy bg-white p-5 no-underline transition-colors hover:bg-cream-deep"
    >
      <span>
        <span className="block font-bold text-navy leading-snug">{headline}</span>
        <span className="block text-sm text-navy-soft mt-1">{detail}</span>
      </span>
      <span className="shrink-0 font-bold text-navy whitespace-nowrap">Veja por quê →</span>
    </a>
  );
}

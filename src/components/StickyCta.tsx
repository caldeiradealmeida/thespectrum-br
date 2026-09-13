"use client";

import { useEffect, useState } from "react";

/**
 * Barra fixa no rodapé (só mobile) que aparece depois que o usuário rolou
 * além das barras de eixo e some quando o bloco da camada 2 está visível.
 */
export function StickyCta({ afterId, targetId }: { afterId: string; targetId: string }) {
  const [pastAxes, setPastAxes] = useState(false);
  const [targetVisible, setTargetVisible] = useState(false);

  useEffect(() => {
    const after = document.getElementById(afterId);
    const target = document.getElementById(targetId);
    if (!after || !target || typeof IntersectionObserver === "undefined") return;

    const obsAfter = new IntersectionObserver(
      ([e]) => setPastAxes(!e.isIntersecting && e.boundingClientRect.bottom < 0),
      { threshold: 0 },
    );
    const obsTarget = new IntersectionObserver(([e]) => setTargetVisible(e.isIntersecting), { threshold: 0.15 });
    obsAfter.observe(after);
    obsTarget.observe(target);
    return () => {
      obsAfter.disconnect();
      obsTarget.disconnect();
    };
  }, [afterId, targetId]);

  const visible = pastAxes && !targetVisible;

  function go() {
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div
      aria-hidden={!visible}
      className={`sm:hidden fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <button
        type="button"
        onClick={go}
        className="w-full rounded-lg bg-navy text-cream font-bold py-3.5 px-5 shadow-[0_-4px_24px_rgba(44,58,87,0.18)] flex items-center justify-between"
      >
        <span className="text-sm opacity-80 font-normal">Relatório completo, grátis</span>
        <span>Ver o porquê →</span>
      </button>
    </div>
  );
}
